import csv

REQUIRED_COLUMNS = ["date", "reach", "clicks", "conversions"]


def _detect_delimiter(header_line):
    # O Excel em português salva CSV com ";" porque a vírgula é o separador
    # decimal. Aceitamos os dois, escolhendo pelo cabeçalho.
    return ";" if header_line.count(";") > header_line.count(",") else ","


def parse_metrics_csv(csv_text):
    # O Excel ("CSV UTF-8") grava um BOM no início do arquivo. Sem removê-lo,
    # a primeira coluna vira "﻿date" e toda linha é rejeitada como
    # "campos ausentes (date)" — str.strip() não remove o BOM.
    csv_text = csv_text.lstrip("﻿").strip()
    lines = csv_text.splitlines()
    if not lines:
        return [], []

    reader = csv.reader(lines, delimiter=_detect_delimiter(lines[0]))
    header = next(reader)
    columns = [column.strip().lower() for column in header]

    parsed = []
    errors = []

    for index, cells in enumerate(reader):
        if not any(cell.strip() for cell in cells):
            continue
        row_number = index + 2

        row = dict(zip(columns, (cell.strip() for cell in cells)))

        missing = [column for column in REQUIRED_COLUMNS if not row.get(column)]
        if missing:
            errors.append(f"Linha {row_number}: campos ausentes ({', '.join(missing)})")
            continue

        try:
            reach = int(float(row["reach"]))
            clicks = int(float(row["clicks"]))
            conversions = int(float(row["conversions"]))
        except ValueError:
            errors.append(f"Linha {row_number}: valores numéricos inválidos")
            continue

        parsed.append(
            {"date": row["date"], "reach": reach, "clicks": clicks, "conversions": conversions}
        )

    return parsed, errors
