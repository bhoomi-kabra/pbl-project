import os
import csv
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header (on pages after first)
        if self._pageNumber > 1:
            self.drawString(36, 580, "🏛️ Nashik Roads & Civic Monitor — Deliverable 3: Issue / Bug Log")
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.5)
            self.line(36, 574, 756, 574)

        # Footer
        footer_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(756, 25, footer_text)
        self.drawString(36, 25, "Confidential — Nashik Municipal Corporation (NMC) PBL Project Submission 2026")
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(36, 36, 756, 36)
        self.restoreState()

def build_pdf(csv_path, output_pdf_path):
    # Landscape Letter: 792 x 612 pt. Margins: 36 pt (0.5 in)
    doc = SimpleDocTemplate(
        output_pdf_path,
        pagesize=landscape(letter),
        leftMargin=36,
        rightMargin=36,
        topMargin=40,
        bottomMargin=45
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#1E3A8A")
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#475569")
    )

    meta_style = ParagraphStyle(
        'DocMeta',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#1E40AF")
    )

    th_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white,
        alignment=0
    )

    td_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor("#0F172A")
    )

    td_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor("#1E3A8A")
    )

    td_cause = ParagraphStyle(
        'TableCellCause',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor("#475569")
    )

    td_fix = ParagraphStyle(
        'TableCellFix',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor("#0F172A")
    )

    story = []

    # Title & Header
    story.append(Paragraph("🏛️ Nashik Roads & Civic Monitor: Deliverable 3 — Issue / Bug Log", title_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>Submission Requirement:</b> Table of Issues/Errors Identified &amp; Debugging/Fixes &nbsp;|&nbsp; <b>Format:</b> Table: Issue ID, Description, Severity, Root Cause, Fix, Status, Date", subtitle_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>Standard:</b> IEEE 1044 Anomaly Classification &nbsp;|&nbsp; <b>Evaluation Status:</b> 14 Issues Logged / 14 Resolved (100% Fix Rate) &nbsp;|&nbsp; <b>Target:</b> Nashik Municipal Corporation", meta_style))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#1E3A8A"), spaceBefore=2, spaceAfter=8))

    # Metrics Summary Row Table
    metric_data = [
        [
            Paragraph("<b>TOTAL ISSUES LOGGED</b><br/><font size='14' color='#1E3A8A'><b>14</b></font>", styles['Normal']),
            Paragraph("<b>CRITICAL (BLOCKER)</b><br/><font size='14' color='#DC2626'><b>3</b> (Resolved)</font>", styles['Normal']),
            Paragraph("<b>HIGH SEVERITY</b><br/><font size='14' color='#EA580C'><b>4</b> (Resolved)</font>", styles['Normal']),
            Paragraph("<b>MEDIUM SEVERITY</b><br/><font size='14' color='#CA8A04'><b>4</b> (Resolved)</font>", styles['Normal']),
            Paragraph("<b>RESOLUTION RATE</b><br/><font size='14' color='#16A34A'><b>100%</b> (14/14)</font>", styles['Normal']),
        ]
    ]
    metric_table = Table(metric_data, colWidths=[144, 144, 144, 144, 144])
    metric_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(metric_table)
    story.append(Spacer(1, 10))

    # Read CSV data
    rows = []
    with open(csv_path, mode='r', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader)
        for r in reader:
            if r:
                rows.append(r)

    # Table columns:
    # 0: Issue ID (55)
    # 1: Description (145)
    # 2: Severity (55)
    # 3: Root Cause (175)
    # 4: Fix (185)
    # 5: Status (50)
    # 6: Date (55)
    # Total width = 720 (available = 792 - 72 = 720)
    col_widths = [55, 145, 55, 175, 185, 50, 55]

    table_data = [[
        Paragraph("Issue ID", th_style),
        Paragraph("Description", th_style),
        Paragraph("Severity", th_style),
        Paragraph("Root Cause", th_style),
        Paragraph("Fix Implemented", th_style),
        Paragraph("Status", th_style),
        Paragraph("Date", th_style),
    ]]

    severity_colors = {
        'Critical': '#DC2626',
        'High': '#EA580C',
        'Medium': '#854D0E',
        'Low': '#0369A1'
    }

    for row in rows:
        issue_id = row[0]
        desc = row[1]
        severity = row[2]
        root_cause = row[3]
        fix = row[4]
        status = row[5]
        date_str = row[6]

        sev_col = severity_colors.get(severity, '#475569')

        table_data.append([
            Paragraph(f"<b>{issue_id}</b>", td_bold),
            Paragraph(desc, td_style),
            Paragraph(f"<font color='{sev_col}'><b>{severity}</b></font>", td_style),
            Paragraph(root_cause, td_cause),
            Paragraph(fix, td_fix),
            Paragraph(f"<font color='#16A34A'><b>{status}</b></font>", td_style),
            Paragraph(date_str, td_style),
        ])

    main_table = Table(table_data, colWidths=col_widths, repeatRows=1)
    
    t_style = [
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0F172A")),
        ('ALIGN', (0,0), (-1,0), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]

    for i in range(1, len(table_data)):
        if i % 2 == 0:
            t_style.append(('BACKGROUND', (0, i), (-1, i), colors.HexColor("#F8FAFC")))
        else:
            t_style.append(('BACKGROUND', (0, i), (-1, i), colors.white))

    main_table.setStyle(TableStyle(t_style))
    story.append(main_table)

    # Build document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF: {output_pdf_path}")

if __name__ == '__main__':
    csv_file = r"c:\Users\BHOOMI KABRA\Desktop\Desktop\pbl project\pgl project assignments\Reports\ISSUE_BUG_LOG.csv"
    pdf_file = r"c:\Users\BHOOMI KABRA\Desktop\Desktop\pbl project\pgl project assignments\Reports\ISSUE_BUG_LOG.pdf"
    build_pdf(csv_file, pdf_file)
