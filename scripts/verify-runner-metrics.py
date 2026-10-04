"""Validate the two runner byte gauges from a Prometheus text scrape."""

import math
import re
import sys

sample = re.compile(
    r'github_actions_runner_directory_bytes\{path="(_diag|_work)"\} '
    r'([+-]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[eE][+-]?[0-9]+)?)'
)
seen = set()
lines = []
for line in sys.stdin:
    line = line.rstrip("\n")
    if not line.startswith("github_actions_runner_directory_bytes"):
        continue
    match = sample.fullmatch(line)
    if not match or match[1] in seen:
        sys.exit("Invalid or duplicate runner directory metric")
    value = float(match[2])
    if not math.isfinite(value) or value < 0:
        sys.exit("Runner directory bytes must be finite and nonnegative")
    seen.add(match[1])
    lines.append(line)
if seen != {"_diag", "_work"}:
    sys.exit("Expected exactly one _diag and one _work metric")
print("\n".join(lines))
