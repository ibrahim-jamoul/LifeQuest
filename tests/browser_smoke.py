"""Point d'entrée historique vers la suite navigateur Playwright Node.

La dépendance est installée avec ``npm install`` et le navigateur utilisé est le
Chrome système. Ce relais conserve la commande Python documentée dans le premier
prototype sans exiger le paquet Playwright pour Python.
"""

from pathlib import Path
import subprocess
import sys


ROOT = Path(__file__).resolve().parents[1]


def main() -> int:
    command = ["npm.cmd" if sys.platform == "win32" else "npm", "run", "test:e2e"]
    return subprocess.call(command, cwd=ROOT)


if __name__ == "__main__":
    raise SystemExit(main())
