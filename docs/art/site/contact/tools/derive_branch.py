"""Derive the empty branch (owl-branch) from the perched owl master for the /kontakt success state.

    python docs/art/site/contact/tools/derive_branch.py

Reads docs/art/site/contact/owl-open.png and writes src/lib/contact/assets/owl-branch.webp on the same 1254x1254 canvas, so it
stacks pixel-exactly under the perched frames. Everything above the branch's top edge inside the owl's footprint is cleared;
the edge under the owl and the letter is interpolated between the visible bark on both sides (with a little bark noise) and
the letter pixels below it are repainted with bark texture sampled further down the same branch. Needs Pillow and NumPy.
"""

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[5]
SRC = ROOT / 'docs/art/site/contact/owl-open.png'
OUT = ROOT / 'src/lib/contact/assets/owl-branch.webp'

# Owl + letter footprint (master px) and the visible bark edge on both sides of it
X0, X1 = 318, 806
Y_CLEAR_TOP = 150


def block_top(alpha: np.ndarray, x: int, y: int) -> int:
	"""Top row of the opaque block that contains (or is the first one below) row y in column x."""
	y += int(np.argmax(alpha[y:, x] > 128))
	while y > 0 and alpha[y - 1, x] > 128:
		y -= 1
	return y


def top_edge(alpha: np.ndarray, x: int) -> int:
	"""Top of the bark in a column just outside the owl (the block that reaches the middle of the branch)."""
	return block_top(alpha, x, 880)


def main() -> None:
	image = np.array(Image.open(SRC).convert('RGBA')).astype(np.float32)
	alpha = image[:, :, 3]
	left_y = np.mean([top_edge(alpha, x) for x in range(X0 - 12, X0)])
	right_y = np.mean([top_edge(alpha, x) for x in range(X1, X1 + 12)])

	rng = np.random.default_rng(7)
	xs = np.arange(X0, X1)
	t = (xs - X0) / (X1 - X0)
	# smoothstep blend plus two octaves of bark noise
	edge = left_y + (right_y - left_y) * (t * t * (3 - 2 * t))
	noise = np.interp(xs, np.linspace(X0, X1, 18), rng.normal(0, 2.6, 18)) + np.interp(xs, np.linspace(X0, X1, 70), rng.normal(0, 0.9, 70))
	edge = edge + noise * np.sin(np.pi * t)  # stays exact where it meets the real bark
	# where the owl does not touch the bark (a gap between them), the real bark edge below wins
	for i, x in enumerate(xs):
		if alpha[int(edge[i]) + 20, x] > 128:
			edge[i] = max(edge[i], block_top(alpha, x, int(edge[i]) + 20))

	rows = np.arange(image.shape[0])[:, None]
	cover = np.clip(rows - edge[None, :] + 0.5, 0, 1)  # 1 px anti-aliased edge
	region = image[:, X0:X1]
	lum = region[:, :, :3].mean(2)
	# bark sample: the same column further down (the branch is ~100 px thick here), else the mean ink
	below = np.roll(region, -70, axis=0)
	bark = np.where((below[:, :, 3:4] > 200) & (below[:, :, :3].mean(2, keepdims=True) < 60), below, np.array([28, 25, 20, 255], np.float32))
	# letter pixels: anything lighter or warmer than the bark
	warm = (region[:, :, 0] - region[:, :, 2]) > 12
	repaint = (cover > 0) & ((lum > 34) | warm)
	region[repaint, :3] = bark[repaint, :3]
	region[repaint, 3] = 255
	# under the edge the branch is solid; above it nothing of the owl remains
	region[:, :, 3] = np.where(rows < Y_CLEAR_TOP, 0, region[:, :, 3] * cover)
	image[:, X0:X1] = region
	# stray feather edges beside the footprint: the bark never rises above row 760 left of x=1000
	image[:760, :1000, 3] = 0
	# tail feather tips just right of the footprint float above the bark: clear them
	for x in range(X1, X1 + 30):
		image[: block_top(alpha, x, 880), x, 3] = 0
	image[image[:, :, 3] < 3] = 0

	Image.fromarray(image.round().astype(np.uint8), 'RGBA').save(OUT, 'WEBP', quality=92, alpha_quality=100, method=6)
	print(f'wrote {OUT.relative_to(ROOT)} (edge {left_y:.0f} -> {right_y:.0f})')


if __name__ == '__main__':
	main()
