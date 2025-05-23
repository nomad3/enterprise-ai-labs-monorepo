"""
Solution Planning & Strategy Engine implementation.
"""
import logging
import re
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

from devagent.core.code_gen.gemini import GeminiClient
from devagent.core.planning.models import (SolutionPlan, Task, TaskPriority,
                                           TaskStatus)
from devagent.core.ticket_engine.models import Requirement, Ticket


class PlanningEngine:
    """Engine for creating and managing solution plans."""

    def __init__(self):
        """Initialize the Planning Engine."""
        self.priority_keywords = {
            TaskPriority.CRITICAL: ["critical", "urgent", "blocker", "security"],
            TaskPriority.HIGH: ["important", "high", "priority", "core"],
            TaskPriority.MEDIUM: ["medium", "normal", "standard"],
            TaskPriority.LOW: ["low", "nice to have", "optional"],
        }

    def create_solution_plan(
        self, ticket: Ticket, requirements: List[Requirement]
    ) -> SolutionPlan:
        """
        Create a solution plan from a ticket and its requirements.

        Args:
            ticket: The ticket to create a plan for
            requirements: List of requirements from the ticket

        Returns:
            SolutionPlan: The created solution plan
        """
        # Create plan
        plan = SolutionPlan(
            id=str(uuid.uuid4()),
            ticket_id=ticket.id,
            summary=f"Solution plan for {ticket.summary}",
            created_at=datetime.utcnow(),
        )

        # Create tasks from requirements
        tasks = []
        for req in requirements:
            task = self._create_task_from_requirement(req, plan.id)
            tasks.append(task)

        # Add dependencies between tasks
        self._add_task_dependencies(tasks)

        # Calculate total effort
        plan.total_estimated_effort = sum(task.estimated_effort for task in tasks)

        # Add tasks to plan
        plan.tasks = tasks

        return plan

    def _create_task_from_requirement(
        self, requirement: Requirement, plan_id: str
    ) -> Task:
        """
        Create a task from a requirement.

        Args:
            requirement: The requirement to create a task from
            plan_id: ID of the plan this task belongs to

        Returns:
            Task: The created task
        """
        # Determine priority based on requirement description
        priority = self._determine_priority(requirement.description)

        # Create task
        task = Task(
            id=str(uuid.uuid4()),
            plan_id=plan_id,
            title=requirement.description,
            description=requirement.description,
            priority=priority,
            status=TaskStatus.TODO,
            estimated_effort=self._estimate_effort(requirement.description),
            created_at=datetime.utcnow(),
        )

        return task

    def _determine_priority(self, description: str) -> TaskPriority:
        """
        Determine task priority based on description.

        Args:
            description: Task description

        Returns:
            TaskPriority: Determined priority
        """
        description_lower = description.lower()

        for priority, keywords in self.priority_keywords.items():
            if any(keyword in description_lower for keyword in keywords):
                return priority

        return TaskPriority.MEDIUM  # Default priority

    def _estimate_effort(self, description: str) -> int:
        """
        Estimate effort required for a task in hours.

        Args:
            description: Task description

        Returns:
            int: Estimated effort in hours
        """
        # Simple estimation based on description length and complexity
        words = len(description.split())
        complexity = len(
            re.findall(r"\b(implement|create|add|build|develop)\b", description.lower())
        )

        # Base effort: 2 hours
        # Add 0.5 hours per 10 words
        # Add 1 hour per complexity keyword
        effort = 2 + (words // 10) * 0.5 + complexity

        return max(1, int(effort))  # Minimum 1 hour

    def _add_task_dependencies(self, tasks: List[Task]):
        """
        Add dependencies between tasks based on their descriptions.

        Args:
            tasks: List of tasks to process
        """
        for i, task in enumerate(tasks):
            dependencies = []

            # Look for dependencies in previous tasks
            for prev_task in tasks[:i]:
                if self._is_dependent(task, prev_task):
                    dependencies.append(prev_task.id)

            task.dependencies = ",".join(dependencies) if dependencies else None

    def _is_dependent(self, task: Task, potential_dependency: Task) -> bool:
        """
        Check if a task depends on another task.

        Args:
            task: The task to check
            potential_dependency: The potential dependency

        Returns:
            bool: True if task depends on potential_dependency
        """
        # Check for common dependency patterns
        task_lower = task.description.lower()
        dep_lower = potential_dependency.description.lower()

        # Check for explicit dependencies
        if "after" in task_lower and potential_dependency.id in task_lower:
            return True

        # Check for implicit dependencies
        if "using" in task_lower and potential_dependency.id in task_lower:
            return True

        if "based on" in task_lower and potential_dependency.id in task_lower:
            return True

        return False

    def estimate_task_effort(self, task: Task) -> int:
        """
        Estimate effort for a specific task.

        Args:
            task: The task to estimate

        Returns:
            int: Estimated effort in hours
        """
        return self._estimate_effort(task.description)

    def validate_solution_plan(self, plan: SolutionPlan) -> Tuple[bool, List[str]]:
        """
        Validate a solution plan.

        Args:
            plan: The plan to validate

        Returns:
            Tuple[bool, List[str]]: (is_valid, list_of_errors)
        """
        errors = []

        # Validate required fields
        if not plan.ticket_id:
            errors.append("Ticket ID is required")

        if not plan.tasks:
            errors.append("Plan must have at least one task")

        # Validate tasks
        for task in plan.tasks:
            if not task.title:
                errors.append(f"Task {task.id} must have a title")

            if not task.priority:
                errors.append(f"Task {task.id} must have a priority")

            if not task.estimated_effort:
                errors.append(f"Task {task.id} must have an effort estimate")

            # Validate dependencies
            if task.dependencies:
                dep_ids = task.dependencies.split(",")
                for dep_id in dep_ids:
                    if not any(t.id == dep_id for t in plan.tasks):
                        errors.append(f"Task {task.id} has invalid dependency {dep_id}")

        return len(errors) == 0, errors


class SolutionPlanner:
    def __init__(self):
        self.gemini_client = GeminiClient()

    def generate_plan(self, task_description: str) -> str:
        logging.info(f"Generating plan for: {task_description}")
        prompt = f"Break down the following task into actionable steps:\n\n{task_description}\n\nProvide a detailed plan."
        plan = self.gemini_client.generate_code(prompt)
        logging.info(f"Generated plan: {plan}")
        return plan

    def execute_plan(self, plan: str) -> str:
        # Placeholder for executing the plan
        return f"Executed plan: {plan}"
