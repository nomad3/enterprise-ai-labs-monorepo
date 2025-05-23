import logging
import requests

class NotificationService:
    def __init__(self, slack_webhook_url: str = None, teams_webhook_url: str = None):
        self.slack_webhook_url = slack_webhook_url
        self.teams_webhook_url = teams_webhook_url
        logging.basicConfig(level=logging.INFO)

    def send_to_slack(self, message: str) -> str:
        if not self.slack_webhook_url:
            logging.warning("Slack webhook URL not configured.")
            return "Slack notification not sent: webhook URL missing."
        try:
            response = requests.post(self.slack_webhook_url, json={"text": message})
            if response.status_code == 200:
                logging.info("Slack notification sent successfully.")
                return "Slack notification sent successfully."
            else:
                logging.error(f"Failed to send Slack notification: {response.text}")
                return f"Failed to send Slack notification: {response.text}"
        except Exception as e:
            logging.error(f"Exception sending Slack notification: {str(e)}")
            return f"Exception sending Slack notification: {str(e)}"

    def send_to_teams(self, message: str) -> str:
        if not self.teams_webhook_url:
            logging.warning("Teams webhook URL not configured.")
            return "Teams notification not sent: webhook URL missing."
        try:
            response = requests.post(self.teams_webhook_url, json={"text": message})
            if response.status_code == 200:
                logging.info("Teams notification sent successfully.")
                return "Teams notification sent successfully."
            else:
                logging.error(f"Failed to send Teams notification: {response.text}")
                return f"Failed to send Teams notification: {response.text}"
        except Exception as e:
            logging.error(f"Exception sending Teams notification: {str(e)}")
            return f"Exception sending Teams notification: {str(e)}" 