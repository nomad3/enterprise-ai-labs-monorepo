"""
Knowledge base for GitHub Actions CI/CD.
This module contains common configurations, best practices, and troubleshooting tips
for setting up and maintaining GitHub Actions workflows, particularly for deployments
to Google Cloud Platform (GCP) and Kubernetes.
"""

GITHUB_ACTIONS_WORKFLOW_STRUCTURE = """
Key elements of a GitHub Actions workflow file (e.g., `.github/workflows/gcp-deploy.yml`):
1.  **`name`**: Defines the workflow name displayed on GitHub.
2.  **`on`**: Specifies triggers for the workflow (e.g., `push` to `main` branch, `pull_request`).
    - `on: [push: { branches: [main] }, pull_request: { branches: [main] }]`
3.  **`env`**: Sets environment variables available to all jobs in the workflow. Useful for GCP Project ID, GCR hostname, image names, etc.
4.  **`permissions`**: Defines default permissions for the `GITHUB_TOKEN`. Crucial for OIDC authentication.
    - `id-token: 'write'` is required for Workload Identity Federation with GCP.
    - `contents: 'read'` is often needed for actions that checkout code.
5.  **`jobs`**: Contains one or more jobs that run in parallel by default or sequentially if `needs` is specified.
    - Each job runs in a fresh runner environment.
    - **`runs-on`**: Specifies the type of runner (e.g., `ubuntu-latest`).
    - **`steps`**: A sequence of tasks executed within a job.
        - **`uses`**: Specifies an action to run (e.g., `actions/checkout@v3`, `google-github-actions/auth@v1`).
        - **`name`**: A descriptive name for the step.
        - **`run`**: Executes command-line programs.
        - **`with`**: Provides input parameters to actions.
"""

GITHUB_ACTIONS_GCP_AUTHENTICATION = """
Authenticating GitHub Actions to Google Cloud Platform (GCP) using Workload Identity Federation (WIF):
1.  **GCP Setup (Terraform or Console):**
    - Create a Workload Identity Pool (e.g., `github-actions-pool`).
    - Create a Workload Identity Pool Provider for GitHub (e.g., `github-actions-provider`) linked to the pool.
        - Issuer URI: `https://token.actions.githubusercontent.com`
        - Attribute mapping: Map GitHub token claims (like `assertion.repository`, `assertion.sub`) to Google attributes.
        - **Crucial:** Define an `attribute_condition` on the provider (e.g., `attribute.repository.startsWith('your-org/your-repo')`) to restrict which GitHub repositories can impersonate.
    - Create a dedicated GCP Service Account (GSA) for CI/CD (e.g., `github-actions-cicd@PROJECT_ID.iam.gserviceaccount.com`).
    - Grant this GSA the necessary IAM roles on your GCP project (e.g., `roles/container.developer`, `roles/artifactregistry.writer`, `roles/artifactregistry.repoAdmin`, `roles/artifactregistry.createOnPushWriter`).
    - Grant the GSA `roles/iam.workloadIdentityUser` permission on itself, with members being the WIF principals (e.g., `principalSet://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-actions-pool/attribute.repository/your-org/your-repo`).

2.  **GitHub Actions Workflow (`gcp-deploy.yml`):**
    - Add `permissions: { id-token: 'write' }` at the workflow or job level.
    - Use `google-github-actions/auth@v1` action:
      ```yaml
      - name: Authenticate to GCP
        uses: google-github-actions/auth@v1
        with:
          workload_identity_provider: 'projects/YOUR_PROJECT_NUMBER/locations/global/workloadIdentityPools/YOUR_POOL_ID/providers/YOUR_PROVIDER_ID'
          service_account: 'YOUR_CICD_GSA_EMAIL'
      ```
    - Subsequent steps can then use `gcloud`, `gsutil`, etc., authenticated as the GSA.
    - **Troubleshooting:** If authentication fails with OIDC errors, print the OIDC token claims in the workflow to verify attributes like `repository` or `sub` for the WIF condition.
      ```yaml
      - name: Debug OIDC Token
        run: |
          echo "Printing OIDC Token claims..."
          curl -sSL \"$ACTIONS_ID_TOKEN_REQUEST_URL&audience=gcp-wif\" -H \"Authorization: bearer $ACTIONS_ID_TOKEN_REQUEST_TOKEN\" | jq .
      ```
"""

GITHUB_ACTIONS_DOCKER = """
Building and pushing Docker images in GitHub Actions, especially for Google Container Registry (GCR) / Artifact Registry:
1.  **Authenticate Docker to GCR/Artifact Registry:**
    - After GCP authentication (`google-github-actions/auth@v1`):
      ```yaml
      - name: Configure Docker for GCR
        run: gcloud auth configure-docker ${{ env.GCR_HOSTNAME }} --quiet
      ```
      (Where `GCR_HOSTNAME` is e.g., `gcr.io` or `us-central1-docker.pkg.dev`)

2.  **Build Docker Image:**
    - Use `docker build` command.
    - **Context & Dockerfile Path:** Pay close attention to the build context and Dockerfile path (`-f`).
      - Example: `docker build -t $IMAGE_NAME:$IMAGE_TAG -f ./path/to/Dockerfile ./path/to/build_context`
    - **Dockerfile `COPY` commands:** Ensure paths in `COPY` instructions are relative to the build context provided to `docker build`.
    - **Image Tagging:** Use meaningful tags, like the commit SHA (`${{ github.sha }}`) for traceability.
      - `IMAGE_TAG: ${{ github.sha }}`
      - `docker tag myimage:latest gcr.io/my-project/myimage:${{ github.sha }}`

3.  **Push Docker Image:**
    - `docker push $IMAGE_NAME:$IMAGE_TAG`
    - **Permissions:** The CI/CD GSA needs appropriate roles:
        - `roles/artifactregistry.writer` for pushing images.
        - `roles/artifactregistry.repoAdmin` if the repository might not exist and needs to be created on push (for GCR, often `roles/storage.admin` historically, but Artifact Registry roles are preferred).
        - `roles/artifactregistry.createOnPushWriter` can be specifically used for `gcr.io` repositories managed by Artifact Registry to allow creation on push.
    - **Error: `gcr.io repo does not exist. Creating on push requires...`**: Indicates missing `repoAdmin` or `createOnPushWriter` permissions, or that the Artifact Registry API itself might not be enabled/used correctly if it's an AR-native repo.
    - **Module Path Issues in `CMD` (Python/Uvicorn):**
        - Ensure the `CMD` in your Dockerfile correctly references your application module considering the `WORKDIR` and how files are `COPY`ed.
        - Example: If `WORKDIR /app` and you `COPY . /app/devagent`, then `CMD ["uvicorn", "devagent.api.main:app"]`. If `COPY . /app`, then `CMD ["uvicorn", "api.main:app"]`.

"""

GITHUB_ACTIONS_HELM_DEPLOYMENT = """
Deploying to Kubernetes (GKE) using Helm in GitHub Actions:
1.  **Get GKE Credentials:**
    - After GCP authentication:
      ```yaml
      - name: Get GKE credentials
        uses: google-github-actions/get-gke-credentials@v1 # Or a more recent version
        with:
          cluster_name: ${{ env.GKE_CLUSTER_NAME }}
          location: ${{ env.GKE_CLUSTER_ZONE }} # Or region for regional clusters
      ```

2.  **Helm Dependency Management:**
    - If your chart has dependencies in `Chart.yaml` (e.g., from Bitnami):
      ```yaml
      - name: Helm Setup and Dependency Build
        run: |
          helm repo add bitnami https://charts.bitnami.com/bitnami
          helm dependency build ./path/to/your/chart
      ```
    - **Error: `found in Chart.yaml, but missing in charts/ directory`**: Solved by running `helm dependency build`.

3.  **Helm Upgrade/Install:**
    - Use `helm upgrade --install RELEASE_NAME ./path/to/chart ...`
    - **`--namespace YOUR_NAMESPACE --create-namespace`**: Good practice.
    - **`-f ./path/to/values-file.yaml`**: Specify environment-specific values.
    - **`--set key1=value1,key2=value2`**: Override values dynamically.
        - Crucial for setting image tags from `github.sha`:
          `--set image.tag=${{ github.sha }}`
          `--set subchart.image.tag=${{ github.sha }}`
        - **Crucial:** Ensure the `--set` paths correctly match the structure in your `values.yaml` file (e.g., `devagentApi.image.repository` vs `devagent-ui.image.repository`). Case sensitivity and path correctness are vital.

4.  **Troubleshooting Pods (Post-Deployment):**
    - **`ImagePullBackOff`**:
        - Verify image name and tag in `values.yaml` or overridden by `--set` are correct and exist in the registry.
        - Check GKE node pool service account permissions if pulling from a private GCR/AR (though WIF for GKE pods is better for direct GCP service access).
    - **`CrashLoopBackOff`**:
        - Check pod logs (`kubectl logs POD_NAME -n NAMESPACE -c CONTAINER_NAME`).
        - **Cloud SQL Proxy Issues**:
            - Ensure Cloud SQL Proxy sidecar is correctly configured (image, args with instance connection name).
            - Verify the GKE pod's service account has `roles/cloudsql.client`.
            - **Crucial Error:** Cloud SQL Proxy failing with `googleapi: Error 403: Cloud SQL Admin API has not been used...` means the **Cloud SQL Admin API** must be enabled in the GCP project.
            - Check `DATABASE_URL` in the application:
                - For Unix socket: `postgresql://USER:PASS@/DB?host=/cloudsql/PROJECT:REGION:INSTANCE`
                - For TCP (proxy listens on `127.0.0.1` in pod): `postgresql://USER:PASS@127.0.0.1:5432/DB`
        - Application errors (e.g., `ModuleNotFoundError` in Python): Check Dockerfile `COPY` paths, `WORKDIR`, and `CMD`.
"""

GITHUB_ACTIONS_TROUBLESHOOTING_COMMON_ISSUES = [
    (
        "OIDC Authentication Failure (401/403 with GCP)",
        "Verify Workload Identity Pool & Provider attribute conditions match GitHub token claims (e.g., repository name, branch). Print OIDC token in workflow for debugging. Ensure `id-token: write` permission.",
    ),
    (
        "GCR/Artifact Registry Push Denied",
        "Ensure CI/CD GSA has `roles/artifactregistry.writer` and `roles/artifactregistry.repoAdmin` (or `createOnPushWriter` for GCR). Check `gcloud auth configure-docker` was successful.",
    ),
    (
        "Helm Error: `dependencies missing in charts/ directory`",
        "Run `helm repo add <repo_name> <repo_url>` for dependencies and then `helm dependency build ./path/to/chart` before `helm upgrade/install`.",
    ),
    (
        "Helm `--set` not working as expected",
        "Double-check the exact path in `values.yaml` (case-sensitive) for the item being overridden. E.g., `devagentApi.image.tag` vs `image.tag`.",
    ),
    (
        "Pod `ImagePullBackOff`",
        "Verify the image name and tag are correct in the registry and accessible. Check image path set by Helm in the deployment/pod spec.",
    ),
    (
        "Pod `CrashLoopBackOff` - API cannot connect to DB via Cloud SQL Proxy",
        "1. Check API's DB connection string (Unix socket vs TCP). 2. Check Cloud SQL Proxy container logs for errors. 3. **Enable Cloud SQL Admin API in GCP Project.** 4. Ensure GKE pod's SA has `cloudsql.client` role.",
    ),
    (
        "Pod `CrashLoopBackOff` - Application Error (e.g., Python `ModuleNotFoundError`)",
        "Check Dockerfile `WORKDIR`, `COPY` instructions, and `CMD` for correct paths and module references relative to the application structure within the image.",
    ),
    (
        "GKE API or other GCP service API not enabled",
        "Many GCP services require their respective APIs (e.g., Kubernetes Engine API, Cloud SQL Admin API, Artifact Registry API, Memorystore API) to be explicitly enabled in the project. Terraform apply or proxy logs will usually indicate this with a 403 error and a link to enable it.",
    ),
]

# Example of how this knowledge might be used by an agent (conceptual)
# def get_github_actions_guidance(topic: str):
#     if topic == "gcp_auth":
#         return GITHUB_ACTIONS_GCP_AUTHENTICATION
#     elif topic == "docker_build":
#         return GITHUB_ACTIONS_DOCKER
#     # ... and so on
#     return "No specific guidance found for that GitHub Actions topic."
