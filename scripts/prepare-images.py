"""
Gera as imagens otimizadas do site a partir de `assets-src/`.

Saídas:
  public/images/**            variantes AVIF + WebP em várias larguras
  public/og/og-<locale>.jpg   imagens de compartilhamento 1200 × 630 por idioma
  src/app/apple-icon.png      ícone 180 × 180
  src/content/images.generated.ts  dimensões e larguras disponíveis (usado pelos componentes)

Requisitos: Python 3.10+ e Pillow 11+ (com suporte a AVIF).
Uso: python scripts/prepare-images.py
"""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets-src"
OUT = ROOT / "public" / "images"
OG_OUT = ROOT / "public" / "og"
FONTS = SRC / "fonts"

BG = (8, 8, 11)
manifest: dict[str, dict] = {}


def save_variants(key: str, img: Image.Image, widths: list[int], alpha: bool = False, quality: int = 72) -> None:
    folder = OUT / key.split("/")[0]
    folder.mkdir(parents=True, exist_ok=True)
    name = key.split("/")[1]
    w0, h0 = img.size
    widths = sorted({min(w, w0) for w in widths})
    for w in widths:
        h = round(h0 * w / w0)
        resized = img.resize((w, h), Image.LANCZOS)
        if not alpha:
            resized = resized.convert("RGB")
        resized.save(folder / f"{name}-{w}.avif", "AVIF", quality=quality - 14, speed=4)
        resized.save(folder / f"{name}-{w}.webp", "WEBP", quality=quality, method=6)
    manifest[key] = {"width": w0, "height": h0, "widths": widths}
    print(f"  {key}: {w0}x{h0} -> {widths}")


def duotone(img: Image.Image, stops: list[tuple[float, tuple[int, int, int]]]) -> Image.Image:
    """Mapeia a luminância para um gradiente (tratamento editorial)."""
    alpha = img.getchannel("A") if img.mode == "RGBA" else None
    gray = ImageOps.autocontrast(img.convert("L"), cutoff=1)
    lut: list[int] = []
    for channel in range(3):
        for v in range(256):
            t = v / 255
            for (t0, c0), (t1, c1) in zip(stops, stops[1:]):
                if t0 <= t <= t1:
                    k = (t - t0) / (t1 - t0) if t1 > t0 else 0
                    lut.append(round(c0[channel] + (c1[channel] - c0[channel]) * k))
                    break
    rgb = Image.merge("RGB", (gray, gray, gray)).point(lut)
    if alpha is not None:
        rgb.putalpha(alpha)
    return rgb


def font(file: str, size: int, weight: int | None = None, extra: dict | None = None) -> ImageFont.FreeTypeFont:
    f = ImageFont.truetype(str(FONTS / file), size)
    try:
        axes = f.get_variation_axes()
        values = []
        for axis in axes:
            name = axis["name"].decode() if isinstance(axis["name"], bytes) else axis["name"]
            if name.lower().startswith("weight") and weight:
                values.append(weight)
            elif extra and name in extra:
                values.append(extra[name])
            else:
                values.append(axis["default"])
        f.set_variation_by_axes(values)
    except OSError:
        pass
    return f


def particle_sphere(size: int, count: int = 5200, scale: float = 0.36) -> Image.Image:
    """Versão estática da esfera do Bruno Assistente (mesma distribuição de Fibonacci), em roxo."""
    import math

    ss = 2
    canvas = Image.new("RGBA", (size * ss, size * ss), (0, 0, 0, 0))
    glow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    c = size * ss / 2
    gd.ellipse((c - c * 0.62, c - c * 0.62, c + c * 0.62, c + c * 0.62), fill=(124, 58, 237, 34))
    glow = glow.filter(ImageFilter.GaussianBlur(size * ss * 0.08))
    canvas.alpha_composite(glow)
    d = ImageDraw.Draw(canvas)
    t = 0.9
    pts = []
    for i in range(count):
        y = 1 - 2 * (i + 0.5) / count
        r = math.sqrt(max(0.0, 1 - y * y))
        th = i * 2.39996323
        x, z = math.cos(th) * r, math.sin(th) * r
        wave = math.sin(x * 6 + t * 3.1) * math.cos(y * 5 - t * 2.3) * math.sin(z * 5 + t * 1.7)
        k = 1 + wave * 0.07 + math.sin(y * 12 + x * 4 + t * 4) * 0.03
        x, y, z = x * k, y * k, z * k
        cr, sr = math.cos(t), math.sin(t)
        x, z = x * cr + z * sr, -x * sr + z * cr
        tl = 0.18
        y, z = y * math.cos(tl) - z * math.sin(tl), y * math.sin(tl) + z * math.cos(tl)
        pts.append((z, x, y, i))
    pts.sort()
    for z, x, y, i in pts:
        depth = (z + 1.3) / 2.6
        persp = 2.7 / (3.1 - z)
        px = c + x * c * 2 * scale * persp
        py = c - y * c * 2 * scale * persp
        rad = (0.55 + depth * 1.1) * ss * size / 900
        lo, hi = (91, 33, 182), (221, 214, 254)
        mix = min(1, max(0, depth * 1.1 - 0.05))
        col = tuple(round(lo[j] + (hi[j] - lo[j]) * mix) for j in range(3))
        if i % 7 == 0:
            col = (139, 92, 246)
        a = round(255 * (0.18 + depth * 0.7))
        d.ellipse((px - rad, py - rad, px + rad, py + rad), fill=col + (a,))
    return canvas.resize((size, size), Image.LANCZOS)


def build_og() -> None:
    OG_OUT.mkdir(parents=True, exist_ok=True)
    base = Image.new("RGB", (1200, 630), BG)
    halo = Image.new("RGBA", base.size, (0, 0, 0, 0))
    ImageDraw.Draw(halo).ellipse((760, 70, 1240, 550), fill=(124, 58, 237, 40))
    halo = halo.filter(ImageFilter.GaussianBlur(90))
    base = Image.alpha_composite(base.convert("RGBA"), halo)
    base.alpha_composite(particle_sphere(560, 4200), (700, 36))
    base = base.convert("RGB")
    lines = ImageDraw.Draw(base)
    for x in range(40, 1200, 160):
        lines.line((x, 0, x, 630), fill=(19, 18, 25))

    roles = {
        "pt-br": ("Desenvolvedor Web & Designer", "Criciúma, SC — Brasil"),
        "en": ("Web Developer & Designer", "Criciúma, SC — Brazil"),
        "es": ("Desarrollador Web y Diseñador", "Criciúma, SC — Brasil"),
    }
    name_font = font("Bricolage.ttf", 104, 700, {"Optical Size": 96})
    role_font = font("Manrope.ttf", 38, 500)
    meta_font = font("JetBrainsMono.ttf", 21, 500)
    for locale, (role, place) in roles.items():
        img = base.copy()
        d = ImageDraw.Draw(img)
        x = 78
        d.text((x, 150), {"pt-br": "PORTFÓLIO", "en": "PORTFOLIO", "es": "PORTAFOLIO"}[locale], font=meta_font, fill=(196, 181, 253))
        d.line((x, 196, x + 56, 196), fill=(139, 92, 246), width=3)
        d.text((x - 4, 236), "Bruno Luque", font=name_font, fill=(250, 250, 250))
        d.text((x, 376), role, font=role_font, fill=(250, 250, 250))
        d.text((x, 452), place, font=meta_font, fill=(180, 180, 192))
        img.save(OG_OUT / f"og-{locale}.jpg", "JPEG", quality=88, optimize=True, progressive=True)
        print(f"  og-{locale}.jpg")


def build_icon() -> None:
    """Ícone de toque: inicial “B” com o ponto roxo da assinatura (sem monograma metálico)."""
    size = 720
    img = Image.new("RGB", (size, size), BG)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((0, 0, size - 1, size - 1), radius=150, fill=(16, 16, 20), outline=(41, 38, 51), width=8)
    f = font("Bricolage.ttf", 470, 700, {"Optical Size": 96})
    bbox = d.textbbox((0, 0), "B", font=f)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (size - tw) / 2 - bbox[0] - 40
    y = (size - th) / 2 - bbox[1]
    d.text((x, y), "B", font=f, fill=(250, 250, 250))
    r = 46
    cx, cy = x + bbox[2] + 40, y + bbox[3] - r
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(139, 92, 246))
    img.resize((180, 180), Image.LANCZOS).save(ROOT / "src" / "app" / "apple-icon.png", optimize=True)
    print("  apple-icon.png")


def main() -> None:
    print("Retratos")
    studio = Image.open(SRC / "brand" / "portrait-studio.png").convert("RGBA")
    studio = studio.crop(studio.getbbox())
    save_variants("portrait/studio", studio, [480, 720, 1000], alpha=True, quality=78)


    print("Arte")
    save_variants("art/layers", Image.open(SRC / "brand" / "layers.png"), [800, 1280, 1672])
    ribbon = Image.open(SRC / "brand" / "ribbon.png")
    save_variants("art/ribbon", ribbon, [800, 1280, 1672])
    save_variants("art/sphere", particle_sphere(1100), [420, 640, 900], alpha=True, quality=80)

    print("Capturas reais — Maréga e Vargas")
    save_variants("work/marega-alice-desktop", Image.open(SRC / "captures" / "marega-alice-desktop.png"), [720, 1200, 1800, 2400], quality=80)
    mobile = Image.open(SRC / "captures" / "marega-alice-mobile.png")
    save_variants("work/marega-alice-mobile", mobile, [300, 450, 600], quality=80)
    team = Image.open(SRC / "captures" / "marega-home-team.png")
    team = team.crop((0, 240, 2880, 1900))
    save_variants("work/marega-home-team", team, [720, 1200, 1800], quality=80)

    print("Capturas reais — Bruno Assistente (base demonstrativa)")
    save_variants("work/system-crm-today", Image.open(SRC / "captures" / "system-crm-today.png"), [720, 1200, 1800, 2400], quality=80)
    save_variants("work/system-crm-pipeline", Image.open(SRC / "captures" / "system-crm-pipeline.png").crop((0, 0, 2880, 1700)), [720, 1200, 1800], quality=80)
    assistant = Image.open(SRC / "captures" / "system-assistant-home.png").crop((0, 0, 2880, 1430))
    save_variants("work/system-assistant-home", assistant, [720, 1200, 1800, 2400], quality=80)

    print("Capturas reais — Central de Compras UNESC (dados fictícios)")
    for profile in ("admin", "fornecedor", "loja"):
        shot = Image.open(SRC / "captures" / f"unesc-{profile}.png").crop((0, 0, 2880, 1640))
        save_variants(f"work/unesc-{profile}", shot, [600, 960, 1440, 2000], quality=80)

    print("Compartilhamento")
    build_og()
    build_icon()

    ts = ROOT / "src" / "content" / "images.generated.ts"
    ts.parent.mkdir(parents=True, exist_ok=True)
    ts.write_text(
        "// Arquivo gerado por scripts/prepare-images.py — não edite manualmente.\n"
        f"export const imageManifest = {json.dumps(manifest, indent=2)} as const;\n\n"
        "export type ImageKey = keyof typeof imageManifest;\n",
        encoding="utf-8",
    )
    print("Manifesto atualizado.")


if __name__ == "__main__":
    main()
