import os
import subprocess
from typing import Optional


class GitService:
    def __init__(self, repo_path: str = "."):
        self.repo_path = repo_path

    def run_git(self, *args) -> str:
        try:
            result = subprocess.run(
                ["git", *args],
                cwd=self.repo_path,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
            )
            if result.returncode != 0:
                return f"Error: {result.stderr}"
            return result.stdout
        except Exception as e:
            return f"Exception: {str(e)}"

    def init(self) -> str:
        return self.run_git("init")

    def branch(self, branch_name: str) -> str:
        return self.run_git("checkout", "-b", branch_name)

    def create_branch_with_ticket(self, ticket_number: str, description: str) -> str:
        branch_name = f"ticket-{ticket_number}-{description}"
        return self.branch(branch_name)

    def commit(self, message: str) -> str:
        self.run_git("add", ".")
        return self.run_git("commit", "-m", message)

    def commit_with_ticket(self, ticket_number: str, message: str) -> str:
        commit_message = f"[Ticket #{ticket_number}] {message}"
        return self.commit(commit_message)

    def push(self, remote: str = "origin", branch: Optional[str] = None) -> str:
        if branch is None:
            branch = self.get_current_branch()
        return self.run_git("push", remote, branch)

    def get_current_branch(self) -> str:
        result = self.run_git("rev-parse", "--abbrev-ref", "HEAD")
        return result.strip() if not result.startswith("Error") else "main"
