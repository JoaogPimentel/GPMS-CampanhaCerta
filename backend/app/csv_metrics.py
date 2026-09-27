REQUIRED_COLUMNS = ["date", "reach", "clicks", "conversions"]


def parse_metrics_csv(csv_text):
    lines = csv_text.strip().splitlines()
    if not lines:
        return [], []

    header, *rows = lines
    columns = [column.strip().lower() for column in header.split(",")]

    parsed = []
    errors = []

    for index, line in enumerate(rows):
        if not line.strip():
            continue
        row_number = index + 2

        cells = [cell.strip() for cell in line.split(",")]
        row = dict(zip(columns, cells))

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
