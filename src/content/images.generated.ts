// Arquivo gerado por scripts/prepare-images.py — não edite manualmente.
export const imageManifest = {
  "portrait/studio": {
    "width": 1101,
    "height": 1387,
    "widths": [
      480,
      720,
      1000
    ]
  },
  "art/layers": {
    "width": 1672,
    "height": 940,
    "widths": [
      800,
      1280,
      1672
    ]
  },
  "art/ribbon": {
    "width": 1672,
    "height": 941,
    "widths": [
      800,
      1280,
      1672
    ]
  },
  "art/sphere": {
    "width": 1100,
    "height": 1100,
    "widths": [
      420,
      640,
      900
    ]
  },
  "work/marega-alice-desktop": {
    "width": 2880,
    "height": 1800,
    "widths": [
      720,
      1200,
      1800,
      2400
    ]
  },
  "work/marega-alice-mobile": {
    "width": 1170,
    "height": 2532,
    "widths": [
      300,
      450,
      600
    ]
  },
  "work/marega-home-team": {
    "width": 2880,
    "height": 1660,
    "widths": [
      720,
      1200,
      1800
    ]
  },
  "work/system-crm-today": {
    "width": 2880,
    "height": 1800,
    "widths": [
      720,
      1200,
      1800,
      2400
    ]
  },
  "work/system-crm-pipeline": {
    "width": 2880,
    "height": 1700,
    "widths": [
      720,
      1200,
      1800
    ]
  },
  "work/system-assistant-home": {
    "width": 2880,
    "height": 1430,
    "widths": [
      720,
      1200,
      1800,
      2400
    ]
  },
  "work/unesc-admin": {
    "width": 2880,
    "height": 1640,
    "widths": [
      600,
      960,
      1440,
      2000
    ]
  },
  "work/unesc-fornecedor": {
    "width": 2880,
    "height": 1640,
    "widths": [
      600,
      960,
      1440,
      2000
    ]
  },
  "work/unesc-loja": {
    "width": 2880,
    "height": 1640,
    "widths": [
      600,
      960,
      1440,
      2000
    ]
  }
} as const;

export type ImageKey = keyof typeof imageManifest;
