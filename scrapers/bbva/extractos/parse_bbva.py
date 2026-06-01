#!/usr/bin/env python3
import sys
sys.path.insert(0, '/tmp/pylibs')

import pdfplumber
import csv
import re
from collections import defaultdict

# PDF files and their report months
PDF_FILES = [
    ("all/unlocked_2026_01_260072001306049.pdf", "Diciembre 2025"),
    ("all/unlocked_2026_02_260402001305059.pdf", "Enero 2026"),
    ("all/unlocked_2026_03_260683001303785.pdf", "Febrero 2026"),
    ("all/unlocked_2026_04_260971001302512_1.pdf", "Marzo 2026"),
    ("all/unlocked_2026_05_261273001301191_2.pdf", "Abril 2026"),
]

MES_INFORME_MAP = {
    "Diciembre 2025": 2025,
    "Enero 2026": 2026,
    "Febrero 2026": 2026,
    "Marzo 2026": 2026,
    "Abril 2026": 2026,
}

# Month name to number
MES_NUM = {
    "Enero": "01", "Febrero": "02", "Marzo": "03", "Abril": "04",
    "Mayo": "05", "Junio": "06", "Julio": "07", "Agosto": "08",
    "Septiembre": "09", "Octubre": "10", "Noviembre": "11", "Diciembre": "12"
}

def categorize(concepto):
    c = concepto.upper()
    # Order matters - more specific first
    if any(k in c for k in ["NOMINA", "SUELDO", "SALARIO", "SUELDO/SALAR", "ABONODENOMINAPORTRANSFERENCIA"]):
        return "Nómina"
    if "PENSION" in c:
        return "Pensión"
    if any(k in c for k in ["PARKING", "PAKING", "LLOGUER", "COMUNIDAD", "CDAD.PROP", "CTAT.PROP", "GUADALHORCE", "JACQUARD", "CONCHA ESPINA", "CONCHAESPINA", "RAMON Y CAJAL", "RAMONYCAJAL", "AIRBNB", "CONCEPCIONARENAL", "PLACA7", "PLACA8"]):
        return "Alquiler/Parking"
    if any(k in c for k in ["SANITAS", "MUTUA MADRILE", "MUTUAMADRILE", "AXA", "SEGUROS", "SECURITAS"]):
        return "Seguros"
    if any(k in c for k in ["AMORTIZACION", "PRESTAMO", "CAIXABANK PAYMENTS", "CAIXABANKPAYMENTS"]):
        return "Préstamo"
    if any(k in c for k in ["MENSUAL DE TARJETA", "MENSUALDETARJETA", "WIZINK"]):
        return "Tarjeta"
    if any(k in c for k in ["ENDESA", "NATURGY", "JAZZTEL", "TELEFONICA", "VODAFONE", "AGUA", "CICLE", "ENI PLENITUDE", "ENIPLENITUDE", "REGSITI", "REPSOL GAS", "REPSOL,S.L.U", "GAS COMERCIALIZADORA", "COMERCIALIZADORAREGULADA", "TELECOMUNICACIONES"]):
        return "Suministros"
    if any(k in c for k in ["IRPF", "IVA ", "IMPUESTO", "TRIBUTO", "HACIENDA", "RECAUDACION", "IBI", "AJUNTAMENT DE TERRASSA", "AJUNTAMENTDETERRASSA", "PLUSVALIA", "RECAUDACIONMUNICIPAL"]) and "ABONOPORTRANSFERENCIA" not in c:
        return "Impuestos"
    if any(k in c for k in ["TGSS", "SEGURIDAD SOCIAL AUTONOMOS", "SEGURIDADSOCIALAUTONOMO", "COTIZACION005R.E.AUTONOMOS"]):
        return "Autónomos"
    if any(k in c for k in ["FONDOS DE INVERSION", "FONDOSDEINVERSION", "CRIPTOACTIVOS", "OPERACIÓNDECRIPTOACTIVOS", "COMPRA DE VALORES", "COMPRADEVALORES", "ALPHABET"]):
        return "Inversión"
    if any(k in c for k in ["SERVIC. COLON", "CEDIPSA", "ESCLATOIL", "E.S.", "GASOLINERA", "GASOL", "4VENTS", "TESLA SPAIN", "TESLASPAIN"]):
        return "Gasolina"
    if any(k in c for k in ["RESTAURANTE", "CAFE", "SUPERBRASA", "VIVARI", "BAR ", "BARVILAMARI", "SISTERS", "MICHIGAN", "BUENAS MIGAS", "BUENASMIGAS", "POSADA", "LISTORESTAURANTE", "LANGOLOITALIANO", "LATERRASSETADEMONTBAU", "QUATRE28", "CHFILLA", "ESTABLIMENTSVIENA", "MAXICATALUNYA"]):
        return "Restaurante"
    if any(k in c for k in ["CARREFOUR", "CARREFT", "MERCADONA", "BON PREU", "BONPREU", "MINIMERCAT", "SUPERMERCADO"]):
        return "Alimentación"
    if any(k in c for k in ["PEAJE", "AUTOPISTAS", "RENFE", "AMB", "TVR EMV", "WIZZ AIR", "WIZZAIR", "TERRASSA MOBILITAT", "TERRASSAMOBILITAT", "BSM", "BLINKAY"]):
        return "Transporte"
    if any(k in c for k in ["UBER", "FREENOW", "BOLT", "VTC TRANSFER", "GREMIO UNION DE TAXISTAS", "GREMIOUNIONDETAXISTAS", "TAXILLIC"]):
        return "Taxi/VTC"
    if any(k in c for k in ["ESCOLA", "ESCOLAANDERSEN", "CURSET", "HIJUMP", "UDEMY"]):
        return "Educación"
    if any(k in c for k in ["EFECTIVO", "CAJERO", "ENCAJA", "ENCAJERO"]):
        return "Retirada Efectivo"
    if any(k in c for k in ["TRANSFERENCIA", "BIZUM", "TRASPASO"]):
        return "Transferencia"
    return "Otros"


def parse_amount(s):
    """Parse amount like -1.234,56 or 1.234,56"""
    s = s.strip().replace('.', '').replace(',', '.')
    return float(s)


def determine_year_from_context(dd_mm, mes_informe):
    """Given DD/MM and mes_informe, determine the full year."""
    month_num = int(dd_mm.split('/')[1])
    year = MES_INFORME_MAP[mes_informe]
    mes_name = mes_informe.split()[0]
    informe_month = int(MES_NUM[mes_name])
    
    # If the movement month is December and report is January, it's previous year
    if month_num == 12 and informe_month == 1:
        return year - 1
    # If movement month is January and report is December, it's next year  
    if month_num == 1 and informe_month == 12:
        return year + 1
    return year


def get_real_mes_informe(fecha_str):
    """Get the real month name from the date."""
    parts = fecha_str.split('/')
    month = int(parts[1])
    year = int(parts[2])
    month_names = {1: "Enero", 2: "Febrero", 3: "Marzo", 4: "Abril", 5: "Mayo",
                   6: "Junio", 7: "Julio", 8: "Agosto", 9: "Septiembre", 
                   10: "Octubre", 11: "Noviembre", 12: "Diciembre"}
    return f"{month_names[month]} {year}"


def parse_cuenta_movements(text, cuenta, mes_informe):
    """Parse account movements from extracted text."""
    movements = []
    lines = text.split('\n')
    
    # Track which section we're in
    in_movements = False
    in_advance = False
    current_section_mes = mes_informe
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        # Detect main movement section
        if re.search(r'Movimientosencuentaen(\w+)', line):
            in_movements = True
            in_advance = False
            i += 1
            continue
        
        # Detect advance section
        if re.search(r'Avancedemovimientosde(\w+)', line):
            in_advance = True
            in_movements = True
            i += 1
            continue
            
        # Skip headers and non-data lines
        if any(x in line for x in ['F.Oper.', 'Saldoinicial:', 'Saldofindemes:', 'Saldo', 'BANCOBILBAO', 'AtenciónBBVA', 'Vienedelahojaanterior', 'Cuenta:', 'http://', 'R.D.2606', 'IBANES', 'BIC:', 'Titular', 'quelefacil', '940603']):
            if line.startswith('Saldofindemes') or line.startswith('Saldo'):
                if 'Saldofindemes' in line:
                    in_movements = False
            i += 1
            continue
        
        if not in_movements:
            i += 1
            continue
        
        # Try to match a movement line: DD/MM DD/MM CONCEPTO IMPORTE SALDO DIVISA
        # Pattern: two dates, then concept, then amount, then balance, then EUR
        m = re.match(r'^(\d{2}/\d{2})\s+(\d{2}/\d{2})\s+(.+?)\s+([-]?[\d.]+,\d{2})\s+([-]?[\d.]+,\d{2})\s+EUR$', line)
        if m:
            fecha_op = m.group(1)
            concepto_part = m.group(3)
            importe_str = m.group(4)
            
            # Collect continuation lines (description details)
            detail_lines = []
            j = i + 1
            while j < len(lines):
                next_line = lines[j].strip()
                # Check if next line is another movement or a section header or footer
                if re.match(r'^\d{2}/\d{2}\s+\d{2}/\d{2}\s+', next_line):
                    break
                if any(x in next_line for x in ['Saldofindemes', 'Avancedemovimientos', 'BANCOBILBAO', 'AtenciónBBVA', 'Saldo', 'Cuenta:', 'F.Oper.', 'IBANES', '940603', 'Vienedelahojaanterior', 'Movimientosencuenta', 'MovimientosdeTarjeta']):
                    break
                if next_line and not next_line.startswith('---'):
                    detail_lines.append(next_line)
                j += 1
            
            full_concepto = concepto_part
            if detail_lines:
                full_concepto += " " + " ".join(detail_lines)
            
            importe = parse_amount(importe_str)
            
            # Determine year
            year = determine_year_from_context(fecha_op, mes_informe)
            month = int(fecha_op.split('/')[1])
            day = int(fecha_op.split('/')[0])
            fecha_full = f"{day:02d}/{month:02d}/{year}"
            
            real_mes = get_real_mes_informe(fecha_full)
            
            tipo = "INGRESO" if importe >= 0 else "GASTO"
            
            movements.append({
                'fecha': fecha_full,
                'mes_informe': real_mes,
                'cuenta': cuenta,
                'tipo': tipo,
                'importe': f"{abs(importe):.2f}",
                'concepto': full_concepto.strip(),
                'categoria': categorize(full_concepto)
            })
            
            i = j
            continue
        
        i += 1
    
    return movements


def parse_tarjeta_movements(text, mes_informe):
    """Parse credit card movements."""
    movements = []
    lines = text.split('\n')
    
    i = 0
    in_tarjeta = False
    periodo_start = None
    periodo_end = None
    
    while i < len(lines):
        line = lines[i].strip()
        
        # Detect tarjeta section
        if '455223******2437' in line and 'CREDITOAQUAMAS' in line:
            in_tarjeta = True
            i += 1
            continue
        
        # Detect period
        if 'Periodoextracto:' in line:
            m = re.search(r'Periodoextracto:\s*(\d{2}/\d{2}/\d{4})-(\d{2}/\d{2}/\d{4})', line)
            if m:
                periodo_start = m.group(1)
                periodo_end = m.group(2)
            i += 1
            continue
            
        if not in_tarjeta:
            i += 1
            continue
        
        # Skip non-data lines
        if any(x in line for x in ['Fecha Concepto', 'Total', 'BANCOBILBAO', 'AtenciónBBVA', 'Sabes que', 'tarjeta', 'Descarga', '940603', 'Límite', 'Contrato', 'CREDITOAQUAMAS', 'Vienedelahojaanterior', 'Periodoextracto', 'Fechadepago', 'DDeeuu', 'TTuurr', 'EEll', 'RReec', 'qquuee', 'OOpp', 'TToo', 'IInn', 'TTEE', 'CCEE', 'CCoo', 'IImm', '(1)', '(2)', '(3)', '(5)', '(6)', '(7)', 'ventajas', 'Google Play', '---']):
            i += 1
            continue
        
        if not line or line.startswith('---'):
            i += 1
            continue
        
        # Try to match tarjeta line: DD/MM/YYYY CONCEPTO LOCALIDAD AMOUNT
        # Amount is at the end, preceded by the location
        m = re.match(r'^(\d{2}/\d{2}/\d{4})\s+(.+?)\s+([\d.]+,\d{2})(\s+[\d.]+,\d{2})?$', line)
        if m:
            fecha = m.group(1)
            middle = m.group(2).strip()
            cargo = m.group(3)
            abono = m.group(4)
            
            # Skip foreign currency detail lines (CAMBIO, COMISION lines follow some entries)
            j = i + 1
            while j < len(lines):
                next_line = lines[j].strip()
                if re.match(r'^(FRANCIA|ALEMANIA|IRLANDA|GEORGIA|HUNGRIA|PORTUGAL|ITALIA|REINO UNIDO|ESTADOS UNIDOS)', next_line):
                    # Country line - might have amount at end
                    # Check if there's an amount pattern  
                    cm = re.match(r'^[A-ZÁÉÍÓÚ\s]+\s+([\d.]+,\d{2})$', next_line)
                    if cm:
                        # This was actually a continuation with the real amount on country line
                        pass
                    j += 1
                    continue
                if 'GELT.' in next_line or 'CAMBIO' in next_line or 'COMISION' in next_line:
                    j += 1
                    continue
                break
            
            # The middle part contains concept + locality
            # For tarjeta, concept is everything
            concepto = middle
            
            if abono and abono.strip():
                # It's a refund/abono
                importe_val = parse_amount(abono.strip())
                tipo = "INGRESO"
            else:
                importe_val = parse_amount(cargo)
                tipo = "GASTO"
            
            real_mes = get_real_mes_informe(fecha)
            
            movements.append({
                'fecha': fecha,
                'mes_informe': real_mes,
                'cuenta': 'Tarjeta 2437',
                'tipo': tipo,
                'importe': f"{importe_val:.2f}",
                'concepto': concepto,
                'categoria': categorize(concepto)
            })
            
            i = j
            continue
        
        i += 1
    
    return movements


def extract_all_text(pdf_path):
    """Extract all text from a PDF, grouped by section (cuenta)."""
    pdf = pdfplumber.open(pdf_path)
    full_text = ""
    for page in pdf.pages:
        text = page.extract_text()
        if text and '---' not in text[:10]:
            full_text += text + "\n"
    pdf.close()
    return full_text


def split_sections(text):
    """Split text into sections by account."""
    sections = {'5283': '', '3672': '', 'tarjeta': ''}
    
    lines = text.split('\n')
    current = None
    
    for line in lines:
        if '201525283' in line or '5283' in line and 'IBAN' in line:
            current = '5283'
        elif '201743672' in line or '3672' in line and 'IBAN' in line:
            current = '3672'
        elif '455223******2437' in line and 'CREDITOAQUAMAS' in line:
            current = 'tarjeta'
        
        if current:
            sections[current] += line + '\n'
    
    return sections


def process_pdf(pdf_path, mes_informe):
    """Process a single PDF file."""
    all_movements = []
    
    full_text = extract_all_text(pdf_path)
    
    # Split into sections by account
    # Find 5283 section
    cuenta5283_text = ""
    cuenta3672_text = ""
    tarjeta_text = ""
    
    lines = full_text.split('\n')
    current_section = None
    
    for line in lines:
        # Detect section changes
        if '201525283' in line:
            current_section = '5283'
        elif '201743672' in line:
            current_section = '3672'
        elif '455223******2437' in line:
            current_section = 'tarjeta'
        elif 'MovimientosdeTarjeta' in line:
            current_section = 'tarjeta'
        
        if current_section == '5283':
            cuenta5283_text += line + '\n'
        elif current_section == '3672':
            cuenta3672_text += line + '\n'
        elif current_section == 'tarjeta':
            tarjeta_text += line + '\n'
    
    # Parse each section
    if cuenta5283_text:
        movs = parse_cuenta_movements(cuenta5283_text, '5283', mes_informe)
        all_movements.extend(movs)
        print(f"  Cuenta *5283: {len(movs)} movimientos")
    
    if cuenta3672_text:
        movs = parse_cuenta_movements(cuenta3672_text, '3672', mes_informe)
        all_movements.extend(movs)
        print(f"  Cuenta *3672: {len(movs)} movimientos")
    
    if tarjeta_text:
        movs = parse_tarjeta_movements(tarjeta_text, mes_informe)
        all_movements.extend(movs)
        print(f"  Tarjeta *2437: {len(movs)} movimientos")
    
    return all_movements


def main():
    import os
    base_dir = "/data/.openclaw/workspace/orion/scrapers/bbva/extractos"
    
    all_movements = []
    seen_keys = set()  # To deduplicate advance movements
    
    for pdf_file, mes_informe in PDF_FILES:
        pdf_path = os.path.join(base_dir, pdf_file)
        print(f"\nProcesando: {pdf_file} ({mes_informe})")
        
        if not os.path.exists(pdf_path):
            print(f"  ⚠️ Archivo no encontrado: {pdf_path}")
            continue
        
        movements = process_pdf(pdf_path, mes_informe)
        all_movements.extend(movements)
        print(f"  Subtotal: {len(movements)} movimientos")
    
    # Deduplicate: advance movements from month N appear again in month N+1
    # Key: fecha + cuenta + importe + first 30 chars of concepto
    unique_movements = []
    for mov in all_movements:
        key = f"{mov['fecha']}|{mov['cuenta']}|{mov['importe']}|{mov['tipo']}|{mov['concepto'][:40]}"
        if key not in seen_keys:
            seen_keys.add(key)
            unique_movements.append(mov)
    
    print(f"\nTotal antes de deduplicar: {len(all_movements)}")
    print(f"Total después de deduplicar: {len(unique_movements)}")
    
    # Sort by date
    def sort_key(m):
        parts = m['fecha'].split('/')
        return (int(parts[2]), int(parts[1]), int(parts[0]))
    
    unique_movements.sort(key=sort_key)
    
    # Write CSV
    csv_path = os.path.join(base_dir, "bbva_movimientos_dic2025_abr2026.csv")
    with open(csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['fecha', 'mes_informe', 'cuenta', 'tipo', 'importe', 'concepto', 'categoria'])
        writer.writeheader()
        writer.writerows(unique_movements)
    
    print(f"\n✅ CSV guardado en: {csv_path}")
    print(f"✅ Total filas: {len(unique_movements)}")
    
    # Generate monthly summary
    summary = defaultdict(lambda: defaultdict(lambda: {'ingresos': 0.0, 'gastos': 0.0}))
    for mov in unique_movements:
        key = (mov['mes_informe'], mov['cuenta'])
        amt = float(mov['importe'])
        if mov['tipo'] == 'INGRESO':
            summary[key[0]][key[1]]['ingresos'] += amt
        else:
            summary[key[0]][key[1]]['gastos'] += amt
    
    summary_path = os.path.join(base_dir, "bbva_resumen_mensual.csv")
    with open(summary_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['mes_informe', 'cuenta', 'total_ingresos', 'total_gastos', 'balance'])
        
        # Order months
        month_order = ["Noviembre 2025", "Diciembre 2025", "Enero 2026", "Febrero 2026", "Marzo 2026", "Abril 2026", "Mayo 2026"]
        for mes in month_order:
            for cuenta in ['5283', '3672', 'Tarjeta 2437']:
                if mes in summary and cuenta in summary[mes]:
                    data = summary[mes][cuenta]
                    balance = data['ingresos'] - data['gastos']
                    writer.writerow([mes, cuenta, f"{data['ingresos']:.2f}", f"{data['gastos']:.2f}", f"{balance:.2f}"])
    
    print(f"✅ Resumen mensual guardado en: {summary_path}")
    
    # Preview
    print("\n--- Primeras 5 filas ---")
    for mov in unique_movements[:5]:
        print(f"{mov['fecha']},{mov['mes_informe']},{mov['cuenta']},{mov['tipo']},{mov['importe']},{mov['concepto'][:60]},{mov['categoria']}")
    
    print("\n--- Últimas 5 filas ---")
    for mov in unique_movements[-5:]:
        print(f"{mov['fecha']},{mov['mes_informe']},{mov['cuenta']},{mov['tipo']},{mov['importe']},{mov['concepto'][:60]},{mov['categoria']}")


if __name__ == '__main__':
    main()
