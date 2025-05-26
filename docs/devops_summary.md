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
    *   Sets `DATABASE_URL` for API to use Cloud SQL Proxy (e.g., `postgresql://USER:PASS@/DB_NAME?host=/cloudsql/PROJECT:REGION:INSTANCE_NAME`).
    *   Sets `REDIS_URL` to Memorystore private IP and port.
    *   API deployment uses KSA `gke-deploy-sa` for Workload Identity: `devagentApi.serviceAccount.create: false`, `devagentApi.serviceAccount.name: "gke-deploy-sa"`.

2.  **Cloud SQL Proxy Sidecar (`templates/_helpers.tpl`, `values-gcp.yaml`):**
    *   `_helpers.tpl` modified for generic `sidecars` injection in deployments.
    *   `values-gcp.yaml` defines `cloud-sql-proxy` sidecar for `devagentApi`.

3.  **Service Account Name in Pods (`templates/_helpers.tpl`):**
    *   **Critical Fix:** `_helpers.tpl` updated to correctly reference `componentValues.serviceAccount.name` for Pod spec's `serviceAccountName` when `componentValues.serviceAccount.create` is `false`.

## IV. GitHub Actions Workflow (`.github/workflows/gcp-deploy.yml`):

1.  **Trigger:** Push to `main` branch.
2.  **Permissions:** `contents: 'read'`, `id-token: 'write'` (for OIDC).
3.  **Authentication to GCP:** `google-github-actions/auth@v1` with Workload Identity Federation (using CI/CD GSA).
4.  **GKE Credentials:** `google-github-actions/get-gke-credentials@v1`.
5.  **Docker Image Build & Push:**
    *   **Login:** `gcloud auth configure-docker ${{ env.GCR_HOSTNAME }} --quiet`.
    *   Builds `devagent-api` and `devagent-ui` images.
    *   **Image Tagging:** Uses commit SHA (`${{ github.sha }}`).
    *   **Build Context & Dockerfile Paths (Critical Fixes):**
        *   API: `docker build ... -f ./devagent/Dockerfile ./devagent` (Corrected from `./devagent-api/`).
        *   UI: `docker build ... -f ./devagent-ui/Dockerfile ./devagent-ui`.
    *   **Dockerfile Corrections (`devagent/Dockerfile`) (Critical Fix):** `COPY` commands updated to be relative to the correct build context (e.g., `COPY requirements.txt .` instead of `COPY devagent/requirements.txt .`).
6.  **Helm Deployment:**
    *   `helm upgrade --install ...` with `-f helm/thefullstackagent/values-gcp.yaml`.
    *   Dynamically sets image repositories and commit SHA tag using `--set`.
7.  **Workflow Cleanup:** Old workflow files (`ci-cd.yml`, `ci.yml`) disabled by renaming (e.g., `ci.yml.disabled`).

## V. Key Troubleshooting Insights:

*   **Iterative IAM:** GCR/Artifact Registry push errors required progressive addition of roles: `storage.admin` -> `artifactregistry.writer` -> `artifactregistry.repoAdmin`.
*   **OIDC Token Debugging:** Temporarily decoding the GitHub OIDC token in the workflow was crucial for identifying exact claim values (e.g., `repository: "nomad3/thefullstackagent"`) to fix Workload Identity Federation conditions.
*   **Docker Build Context:** Understanding and correctly setting Docker's build context (`docker build ... <context_path>`) and ensuring `COPY` paths in Dockerfiles are relative to that context is vital.

---
*This summary should be updated as the DevOps setup evolves. Remember to replace placeholders like `YOUR_PROJECT_ID` with actual values if used in commands or direct references not handled by Terraform variables.* 