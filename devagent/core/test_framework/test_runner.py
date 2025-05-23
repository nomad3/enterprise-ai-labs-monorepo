import tempfile
import subprocess
import os
import re
from typing import Dict

class TestRunner:
    def run_tests(self, code: str, tests: str) -> Dict[str, str]:
        # Remove 'if __name__ == "__main__":' block from tests
        cleaned_tests = self._remove_main_block(tests)
        with tempfile.TemporaryDirectory() as tmpdir:
            code_path = os.path.join(tmpdir, "code_under_test.py")
            test_path = os.path.join(tmpdir, "test_code.py")

            # Write code and test files
            with open(code_path, "w") as f:
                f.write(code)
            with open(test_path, "w") as f:
                # Import the code under test in the test file
                f.write(f"import sys\nsys.path.insert(0, '{tmpdir}')\n")
                f.write("from code_under_test import *\n")
                f.write(cleaned_tests)

            # Run pytest
            result = subprocess.run(
                ["pytest", test_path, "--tb=short", "-q"],
                cwd=tmpdir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
            )
            return {
                "stdout": result.stdout,
                "stderr": result.stderr,
                "exit_code": str(result.returncode),
            }

    def _remove_main_block(self, code: str) -> str:
        # Remove 'if __name__ == "__main__":' and its indented block
        pattern = re.compile(r"^if __name__ == ['\"]__main__['\"]:\n(?:    .+\n?)*", re.MULTILINE)
        return re.sub(pattern, "", code) 