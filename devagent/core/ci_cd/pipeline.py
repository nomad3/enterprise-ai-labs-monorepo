import logging
import time

class PipelineService:
    def __init__(self):
        logging.basicConfig(level=logging.INFO)

    def build(self) -> str:
        logging.info("Starting build process...")
        time.sleep(2)  # Simulate build time
        logging.info("Build completed successfully.")
        return "Build successful"

    def test(self) -> str:
        logging.info("Starting test process...")
        time.sleep(1)  # Simulate test time
        logging.info("Tests completed successfully.")
        return "Tests passed"

    def deploy(self) -> str:
        logging.info("Starting deployment process...")
        time.sleep(3)  # Simulate deployment time
        logging.info("Deployment completed successfully.")
        return "Deployment successful" 