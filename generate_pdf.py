
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, Image
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.lib.units import inch
import re
import os

# Path to the logo generated earlier
LOGO_PATH = r"C:\Users\Saad Shaikh\.gemini\antigravity\brain\c7303a7f-41e7-4a2b-aede-0e609e3e8ade\mediguide_ai_logo_1775386289222.png"

def add_header_footer(canvas, doc):
    canvas.saveState()
    
    # Header
    canvas.setFont('Helvetica-Bold', 10)
    canvas.drawString(inch, A4[1] - 0.5 * inch, "MediGuide AI – Project Report")
    canvas.line(inch, A4[1] - 0.6 * inch, A4[0] - inch, A4[1] - 0.6 * inch)
    
    # Footer
    canvas.setFont('Helvetica', 9)
    canvas.drawString(inch, 0.5 * inch, "Made and Designed by Zaid AI")
    page_num = canvas.getPageNumber()
    text = "Page %s" % page_num
    canvas.drawRightString(A4[0] - inch, 0.5 * inch, text)
    canvas.line(inch, 0.7 * inch, A4[0] - inch, 0.7 * inch)
    
    canvas.restoreState()

def create_pdf(input_file, output_file):
    doc = SimpleDocTemplate(output_file, pagesize=A4,
                            rightMargin=72, leftMargin=72,
                            topMargin=80, bottomMargin=80)
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    inst_style = ParagraphStyle(
        'InstStyle',
        parent=styles['Heading1'],
        fontSize=16,
        alignment=TA_CENTER,
        spaceAfter=8,
        color=colors.black,
        leading=20
    )
    
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontSize=24,
        alignment=TA_CENTER,
        spaceBefore=10,
        spaceAfter=10,
        color=colors.darkblue,
        leading=30
    )
    
    subtitle_style = ParagraphStyle(
        'SubtitleStyle',
        parent=styles['Normal'],
        fontSize=14,
        alignment=TA_CENTER,
        spaceAfter=12
    )

    group_style = ParagraphStyle(
        'GroupStyle',
        parent=styles['Normal'],
        fontSize=12,
        alignment=TA_CENTER,
        spaceAfter=6,
        leading=16
    )
    
    heading1_style = ParagraphStyle(
        'Heading1Style',
        parent=styles['Heading1'],
        fontSize=18,
        spaceBefore=20,
        spaceAfter=10,
        color=colors.HexColor("#1A5276"),
        borderPadding=10,
        borderWidth=1,
        borderColor=colors.HexColor("#D4E6F1"),
        backColor=colors.HexColor("#EBF5FB")
    )
    
    heading2_style = ParagraphStyle(
        'Heading2Style',
        parent=styles['Heading2'],
        fontSize=14,
        spaceBefore=15,
        spaceAfter=8,
        color=colors.HexColor("#1F618D"),
        leftIndent=10
    )
    
    normal_style = ParagraphStyle(
        'NormalStyle',
        parent=styles['Normal'],
        fontSize=11,
        alignment=TA_JUSTIFY,
        leading=15,
        spaceAfter=6
    )

    cert_style = ParagraphStyle(
        'CertStyle',
        parent=styles['Normal'],
        fontSize=13,
        alignment=TA_JUSTIFY,
        leading=20,
        spaceBefore=20,
        spaceAfter=20
    )

    elements = []

    if not os.path.exists(input_file):
        print(f"Error: {input_file} not found.")
        return

    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Process lines to elements
    i = 0
    is_cover = True
    
    while i < len(lines):
        line = lines[i].strip()
        
        if not line:
            i += 1
            continue

        # Handle Cover Page
        if is_cover:
            # Institution Name keywords
            inst_keywords = ["Suman Educational", "Dilkap Research", "Mamdapur", "Department of", "( Internet of", "& Cyber Security"]
            if any(key in line for key in inst_keywords):
                elements.append(Paragraph(f"<b>{line}</b>", inst_style))
                i += 1
                continue
            
            if "Mini Project Report On" in line:
                elements.append(Spacer(1, 0.4*inch))
                elements.append(Paragraph(line, subtitle_style))
                i += 1
                continue

            if '"MediGuide AI' in line:
                elements.append(Spacer(1, 0.2*inch))
                if os.path.exists(LOGO_PATH):
                    try:
                        logo = Image(LOGO_PATH, 2*inch, 2*inch)
                        elements.append(logo)
                    except:
                        pass
                elements.append(Spacer(1, 0.2*inch))
                elements.append(Paragraph(f"<b>{line}</b>", title_style))
                i += 1
                continue

            if "Bachelor of Engineering" in line or "Academic Year" in line or "By" in line or "University of Mumbai" in line:
                elements.append(Paragraph(line, group_style))
                if "Academic Year" in line and i > 20: # Heuristic for end of cover
                    elements.append(PageBreak())
                    is_cover = False
                i += 1
                continue
            
            if "Group member" in line:
                elements.append(Paragraph(line, group_style))
                i += 1
                continue

        # Handle Certificate
        if "CERTIFICATE" in line:
            elements.append(Spacer(1, 0.5*inch))
            elements.append(Paragraph("<b>CERTIFICATE</b>", inst_style))
            elements.append(Spacer(1, 0.3*inch))
            cert_text = ""
            i += 1
            while i < len(lines) and "Guide" not in lines[i] and "Internal Examiner" not in lines[i] and "HOD" not in lines[i]:
                if lines[i].strip():
                    cert_text += lines[i].strip() + " "
                i += 1
            elements.append(Paragraph(cert_text, cert_style))
            elements.append(Spacer(1, 0.5*inch))
            
            sig_data = [
                ["Prof. (Guide name)", "Prof. Akshata Laddha", ""],
                ["Guide", "HOD", "External Examiner"]
            ]
            sig_table = Table(sig_data, colWidths=[2*inch, 2*inch, 2*inch])
            sig_table.setStyle(TableStyle([
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('FONTNAME', (0,0), (-1,-1), 'Helvetica-Bold'),
                ('FONTSIZE', (0,0), (-1,-1), 9),
                ('TOPPADDING', (0,0), (-1,-1), 40),
            ]))
            elements.append(sig_table)
            elements.append(PageBreak())
            continue

        # Handle TOC
        if "Table of Contents" in line:
            elements.append(Paragraph("<b>Table of Contents</b>", heading1_style))
            i += 1
            toc_data = []
            # Gather TOC entries
            while i < len(lines) and "Abstract" not in lines[i] and not lines[i].strip().startswith("Abstract"):
                l = lines[i].strip()
                if l:
                    # Look for trailing page number (e.g. "Section Name 10" or "Section Name. 10")
                    match = re.search(r'(.*?)\.?\s*(\d+)$', l)
                    if match:
                        toc_data.append([match.group(1).strip(), match.group(2)])
                    else:
                        toc_data.append([l, ""])
                i += 1
            
            # Special case for "Abstract" line which might have been skipped by the loop
            if i < len(lines) and "Abstract" in lines[i]:
                 l = lines[i].strip()
                 match = re.search(r'(.*?)\.?\s*(\d+)$', l)
                 if match:
                     toc_data.append([match.group(1).strip(), match.group(2)])
                 else:
                     toc_data.append([l, ""])
                 i += 1

            if toc_data:
                t_toc = Table(toc_data, colWidths=[5.5*inch, 0.5*inch])
                t_toc.setStyle(TableStyle([
                    ('ALIGN', (1,0), (1,-1), 'RIGHT'),
                    ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
                    ('FONTSIZE', (0,0), (-1,-1), 11),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 8),
                ]))
                elements.append(t_toc)
            elements.append(PageBreak())
            continue

        # Headings
        if re.match(r'^\d+\. ', line) or line in ["Abstract", "Acknowledgement", "List of Abbreviations", "List of Figures", "List of Tables", "References", "Conclusion and Future work"]:
            elements.append(Paragraph(f"<b>{line}</b>", heading1_style))
        elif re.match(r'^\d+\.\d+ ', line):
            elements.append(Paragraph(f"<b>{line}</b>", heading2_style))
        
        # Bullet points
        elif line.startswith('●') or line.startswith('•'):
            elements.append(Paragraph(f"&bull; {line[1:].strip()}", normal_style))
        
        # Tables
        elif line.startswith('+---') or line.startswith('|'):
            table_lines = []
            while i < len(lines) and (lines[i].strip().startswith('+---') or lines[i].strip().startswith('|')):
                table_lines.append(lines[i].strip())
                i += 1
            
            data = []
            for tl in table_lines:
                if tl.startswith('|'):
                    cells = [c.strip() for c in tl.split('|')[1:-1]]
                    if cells:
                        data.append(cells)
            
            if data:
                t = Table(data, hAlign='CENTER', repeatRows=1)
                t.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#D4E6F1")),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor("#1F618D")),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, -1), 9),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ]))
                elements.append(Spacer(1, 0.1*inch))
                elements.append(t)
                elements.append(Spacer(1, 0.2*inch))
            continue

        # Standalone page numbers from text - skip them
        elif re.match(r'^\d+$', line):
            pass

        # Normal text
        else:
            elements.append(Paragraph(line, normal_style))

        i += 1

    doc.build(elements, onFirstPage=add_header_footer, onLaterPages=add_header_footer)
    print(f"PDF successfully generated: {output_file}")

if __name__ == "__main__":
    create_pdf("MediGuide_AI_Report.txt", "MediGuide_AI_College_Report.pdf")
