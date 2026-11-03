"""Compatibility entry point for the current cloud-bank finisher.

Historical rejected implementation: _process-mist-rejected-1.py.
Run this file with Python, or run _process-mist.mjs directly with Node.
"""
from pathlib import Path
import subprocess

if __name__ == "__main__":
    subprocess.run(["node", str(Path(__file__).with_suffix(".mjs"))], check=True)
