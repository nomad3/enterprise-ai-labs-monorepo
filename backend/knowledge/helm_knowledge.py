"""
Helm Knowledge Base for DevAgent
Contains patterns, best practices, and templates for Helm chart creation and testing
"""

HELM_CHART_STRUCTURE = {
    'Chart.yaml': {
        'required_fields': [
            'apiVersion',
            'name',
            'version',
            'description'
        ],
        'optional_fields': [
            'keywords',
            'home',
            'sources',
            'maintainers',
            'icon',
            'appVersion',
            'deprecated',
            'type'
        ]
    },
    'values.yaml': {
        'best_practices': [
            'Use nested maps for related values',
            'Provide sensible defaults',
            'Document all values',
            'Use consistent naming',
            'Group related values'
        ]
    },
    'templates/': {
        'required_files': [
            'deployment.yaml',
            'service.yaml',
            'ingress.yaml',
            '_helpers.tpl'
        ],
        'optional_files': [
            'configmap.yaml',
            'secret.yaml',
            'hpa.yaml',
            'pdb.yaml'
        ]
    }
}

HELM_BEST_PRACTICES = [
    'Use semantic versioning',
    'Implement proper value validation',
    'Use templates for DRY code',
    'Implement proper documentation',
    'Use appropriate chart dependencies',
    'Implement proper testing',
    'Use appropriate security contexts',
    'Implement proper resource management'
]

HELM_TESTING = {
    'unit_tests': {
        'tools': [
            'helm-unittest',
            'helm-test'
        ],
        'best_practices': [
            'Test all templates',
            'Test value validation',
            'Test template functions',
            'Test conditional logic'
        ]
    },
    'integration_tests': {
        'tools': [
            'helm-test',
            'kind',
            'minikube'
        ],
        'best_practices': [
            'Test in real cluster',
            'Test all features',
            'Test upgrade paths',
            'Test rollback'
        ]
    }
}

def generate_helm_chart(requirements: dict) -> dict:
    """
    Generate Helm chart based on requirements
    Returns a dictionary with chart files and contents
    """
    # Implementation will use LLM to generate chart based on requirements
    pass

def validate_helm_chart(chart_path: str) -> dict:
    """
    Validate Helm chart
    Returns validation results and suggestions
    """
    # Implementation will use helm lint and custom checks
    pass

def test_helm_chart(chart_path: str) -> dict:
    """
    Test Helm chart
    Returns test results and suggestions
    """
    # Implementation will use helm test and custom checks
    pass 