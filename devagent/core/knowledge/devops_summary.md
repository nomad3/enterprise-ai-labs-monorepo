# DevOps Summary: CI/CD and GKE Deployment for TheFullStackAgent

This document summarizes the key configurations, challenges, and solutions encountered while setting up the CI/CD pipeline and deploying `thefullstackagent` project to Google Kubernetes Engine (GKE).

## I. Overall Goal & Architecture:

*   **Objective:** Deploy `thefullstackagent` project (composed of `devagent-api` and `devagent-ui`) to Google Kubernetes Engine (GKE).
*   **Infrastructure as Code:** Terraform manages GCP resources (VPC, GKE cluster, Cloud SQL for PostgreSQL, Memorystore for Redis, GCS bucket, Service Accounts, IAM for Workload Identity).
*   **Application Deployment:** Helm charts are used to deploy the application components to GKE.
*   **CI/CD:** GitHub Actions automates building Docker images, pushing them to Google Container Registry (GCR), and deploying the Helm chart.

## II. Terraform Configuration Highlights:

Key Terraform files: `terraform/main.tf`, `terraform/variables.tf`, `terraform/outputs.tf`, `terraform/cicd.tf`.

1.  **GKE Cluster & Node Pools (`main.tf`):**
    *   Configured `google_container_cluster.gke` and `google_container_node_pool.primary_nodes`.
    *   **Key Learning:** Careful management of the default node pool configuration within the GKE cluster resource (e.g., `initial_node_count = 1`, aligning `node_config` like `machine_type`) is crucial to prevent Terraform from showing perpetual diffs after GCP auto-adjustments.

2.  **Service Account for GKE Pods (e.g., Cloud SQL Proxy - `gke-deploy-sa`) (`main.tf`):**
    *   Dedicated Google Service Account (GSA): `gke-deploy-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com`.
    *   **Permissions Granted:**
        *   `roles/container.developer`
        *   `roles/storage.objectAdmin`
        *   `roles/cloudsql.client` (for Cloud SQL Proxy)

3.  **Workload Identity for GKE Pods (`main.tf`):**
    *   Enabled via `workload_identity_config` on GKE cluster and `workload_metadata_config { mode = "GKE_METADATA" }` on the node pool.
    *   A Kubernetes Service Account (KSA), also named `gke-deploy-sa`, is used in the `devagent` namespace (created/managed by Helm or `kubectl`).
    *   **IAM Binding:** GSA `gke-deploy-sa@...` granted `roles/iam.workloadIdentityUser` for KSA member `serviceAccount:YOUR_PROJECT_ID.svc.id.goog[devagent/gke-deploy-sa]`.
    *   **KSA Annotation:** KSA `gke-deploy-sa` annotated in Kubernetes: `iam.gke.io/gcp-service-account=gke-deploy-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com`.

4.  **CI/CD Service Account for GitHub Actions (`github-actions-cicd`) (`cicd.tf`):**
    *   Dedicated GSA: `github-actions-cicd@YOUR_PROJECT_ID.iam.gserviceaccount.com`.
    *   **Workload Identity Federation (GitHub Actions to GCP):**
        *   `google_iam_workload_identity_pool.github_actions_pool`
        *   `google_iam_workload_identity_pool_provider.github_actions_provider` (OIDC issuer: `https://token.actions.githubusercontent.com`)
        *   `attribute_mapping`: Maps GitHub token claims (e.g., `assertion.sub`, `assertion.repository`) to Google attributes.
        *   **Critical Fix 1:** The provider required an `attribute_condition` (e.g., `attribute.repository.startsWith('nomad3/')`) for creation when `attribute_mapping` was used.
        *   **Critical Fix 2:** The IAM binding (`google_service_account_iam_member.cicd_sa_wif_user`) for `roles/iam.workloadIdentityUser` had its `member` field corrected to the accurate GitHub repo name: `.../attribute.repository/nomad3/thefullstackagent` (was `nomade`).
    *   **Permissions for CI/CD GSA (`cicd.tf`):**
        *   `roles/container.developer` (GKE interaction)
        *   `roles/storage.admin` (Initial GCR access)
        *   `roles/artifactregistry.writer` (Solved GCR/Artifact Registry push permission denied for `uploadArtifacts`)
        *   `roles/artifactregistry.repoAdmin` (Solved `gcr.io repo does not exist. Creating on push requires...` by allowing `createOnPush`)

## III. Helm Chart Configuration (`helm/thefullstackagent`):

1.  **`values-gcp.yaml`:**
    *   Disables PostgreSQL (`postgresql.enabled: false`) and Redis (`redis.enabled: false`) subcharts.
    *   Sets `DATABASE_URL` for API to use Cloud SQL Proxy. Initially via Unix socket, later updated to TCP (`postgresql+asyncpg://postgres:replace-with-secure-password@127.0.0.1:5432/devagent`) for better compatibility with the proxy's listener within the pod.
    *   Sets `REDIS_URL` to Memorystore private IP and port.
    *   API deployment uses KSA `gke-deploy-sa` for Workload Identity: `devagentApi.serviceAccount.create: false`, `devagentApi.serviceAccount.name: "gke-deploy-sa"`.

2.  **Cloud SQL Proxy Sidecar (`templates/_helpers.tpl`, `values-gcp.yaml`):**
    *   `_helpers.tpl` modified for generic `sidecars` injection in deployments.
    *   `values-gcp.yaml` defines `cloud-sql-proxy` sidecar for `devagentApi`.

3.  **Service Account Name in Pods (`templates/_helpers.tpl`):**
    *   **Critical Fix:** `_helpers.tpl` updated to correctly reference `componentValues.serviceAccount.name` for Pod spec's `serviceAccountName` when `componentValues.serviceAccount.create` is `false`.

## IV. GitHub Actions CI/CD Workflow (`.github/workflows/gcp-deploy.yml`)

This section details the setup and key troubleshooting steps for the CI/CD pipeline using GitHub Actions.

1.  **Workflow Trigger:**
    *   The workflow is triggered on `push` to the `main` branch.

2.  **Permissions for OIDC:**
    *   The workflow requires `id-token: 'write'` and `contents: 'read'` permissions at the job level for Workload Identity Federation with GCP.

3.  **Authentication to GCP:**
    *   Uses `google-github-actions/auth@v1` action.
    *   Authenticates using Workload Identity Federation, impersonating the `github-actions-cicd` Google Service Account.
    *   **Troubleshooting (OIDC Token):** Debugging involved printing OIDC token claims to ensure the `attribute_condition` in the WIF provider (e.g., `attribute.repository/nomad3/thefullstackagent`) matched the actual claims.

4.  **GKE Credentials:**
    *   Uses `google-github-actions/get-gke-credentials@v1` to configure `kubectl` access to the GKE cluster.

5.  **Docker Image Build & Push to Google Container Registry (GCR):**
    *   **GCR Login:** `gcloud auth configure-docker ${{ env.GCR_HOSTNAME }} --quiet`.
    *   **Image Building:** `devagent-api` and `devagent-ui` images are built using `docker build`.
    *   **Image Tagging:** Images are tagged with the commit SHA (`${{ github.sha }}`) for versioning.
    *   **Build Context & Dockerfile Paths (Fixes):**
        *   Corrected API build context to `./devagent` and Dockerfile path to `./devagent/Dockerfile`.
        *   `COPY` commands within `devagent/Dockerfile` were updated to be relative to the new build context.
    *   **Dockerfile CMD for API (Fixes):**
        *   The `CMD` in `devagent/Dockerfile` was iterated upon:
            *   Initial: `devagent.api.main:app` (caused `ModuleNotFoundError: No module named 'devagent'` when `COPY . /app`)
            *   Attempt 2: `api.main:app` (fixed initial error but led to internal `ModuleNotFoundError: No module named 'devagent.core'`)
            *   Final (Correct): `COPY . /app/devagent` and `CMD ["uvicorn", "devagent.api.main:app", ...]`. This structure ensured Python's module resolution worked correctly within the container.
    *   **GCR Push Permissions (Troubleshooting):**
        *   Initial `roles/storage.admin` was insufficient.
        *   Added `roles/artifactregistry.writer` to fix `artifactregistry.repositories.uploadArtifacts` denial.
        *   Added `roles/artifactregistry.repoAdmin` to fix `gcr.io repo does not exist. Creating on push requires...` error.
        *   Finally added `roles/artifactregistry.createOnPushWriter` which is more specific for GCR create-on-push scenarios.

6.  **Helm Deployment to GKE:**
    *   **Dependency Management (Fix):** Added `helm repo add bitnami https://charts.bitnami.com/bitnami` and `helm dependency build ./helm/thefullstackagent` to resolve missing chart dependencies (`postgresql`, `redis`) during `helm upgrade`.
    *   Uses `helm upgrade --install devagent ./helm/thefullstackagent ...`
    *   Specifies `devagent` namespace (`--namespace devagent --create-namespace`).
    *   Uses GCP-specific values: `-f ./helm/thefullstackagent/values-gcp.yaml`.
    *   **Dynamic Image Configuration (Fixes):**
        *   Sets image repositories and tags:
            *   `--set devagentApi.image.repository=${{ env.GCR_HOSTNAME }}/${{ env.GCP_PROJECT_ID }}/${{ env.IMAGE_API }}`
            *   `--set devagentApi.image.tag=${{ github.sha }}`
            *   `--set devagent-ui.image.repository=${{ env.GCR_HOSTNAME }}/${{ env.GCP_PROJECT_ID }}/${{ env.IMAGE_UI }}` (Corrected from `devagentUi.image.repository`)
            *   `--set devagent-ui.image.tag=${{ github.sha }}`

7.  **Workflow File Management:**
    *   Older/redundant workflow files (e.g., `ci-cd.yml`, `ci.yml`) were disabled by renaming them (e.g., `ci.yml.disabled`) to prevent unintended runs.

## V. Key Overall Troubleshooting Insights & Learnings:

*   **API Enablement:** Crucially, the **Cloud SQL Admin API** needed to be manually enabled in the GCP project. The Cloud SQL Proxy requires this to fetch instance metadata, and its absence led to `Connection refused` errors for the API connecting to the database, despite the proxy container itself appearing to run. Other APIs like Kubernetes Engine API and Artifact Registry API were also enabled as needed.
*   **Iterative IAM:** Permissions, especially for the CI/CD GSA interacting with GCR/Artifact Registry and the GKE pod GSA interacting with Cloud SQL, often require iterative refinement. Start with least privilege and add roles as specific errors indicate necessity.
*   **OIDC Token Debugging (WIF):** When Workload Identity Federation fails, printing the OIDC token claims directly in the GitHub Actions workflow is invaluable for identifying discrepancies between expected and actual claims (e.g., `repository` name, `branch` name) used in the WIF provider's attribute conditions.
*   **Docker Build Context & `COPY` Paths:** Mismatches between the `docker build` context path and the paths used in Dockerfile `COPY` commands are a common source of "file not found" errors during image builds or `ModuleNotFoundError` at runtime.
*   **Helm Value Paths:** When using `helm --set`, the path to the value must exactly match the structure in `values.yaml` (e.g., `devagentApi.image.tag` vs. a sub-chart's `devagent-ui.image.tag`).
*   **Terraform State & GCP Drift:** For GKE default node pools or other resources GCP might modify post-creation, ensure Terraform configurations align with GCP's actual state to avoid persistent diffs. Refreshing Terraform state (`terraform refresh`) can sometimes help, but direct configuration adjustment is often needed.
*   **Cloud SQL Proxy Connectivity:** When the API fails to connect through the proxy:
    1.  Check API's connection string (Unix socket vs. TCP `127.0.0.1:PORT`).
    2.  Check Cloud SQL Proxy container logs for its own connection errors to the backend (often permission or API enablement issues).
    3.  Ensure the GKE pod's service account has `roles/cloudsql.client`.

---
*This summary should be updated as the DevOps setup evolves. Remember to replace placeholders like `YOUR_PROJECT_ID` with actual values if used in commands or direct references not handled by Terraform variables.* 