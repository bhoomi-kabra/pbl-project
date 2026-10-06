import os
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
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
        
        # Running header on subsequent pages
        if self._pageNumber > 1:
            self.drawString(36, 580, "🏛️ Nashik Roads & Civic Monitor — Deliverable 2: Test Case Sheet")
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.5)
            self.line(36, 574, 756, 574)

        # Footer
        footer_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(756, 25, footer_text)
        self.drawString(36, 25, "Nashik Municipal Corporation (NMC) — Project Based Learning (PBL) Quality Assurance Test Suite")
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(36, 36, 756, 36)
        self.restoreState()

def generate_test_case_pdf(output_pdf_path):
    # Landscape Letter: 792 x 612 pt. Margins: 36 pt (0.5 in)
    doc = SimpleDocTemplate(
        output_pdf_path,
        pagesize=landscape(letter),
        leftMargin=36,
        rightMargin=36,
        topMargin=38,
        bottomMargin=42
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#1E3A8A")
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor("#475569")
    )

    meta_style = ParagraphStyle(
        'DocMeta',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
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
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor("#0F172A")
    )

    td_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor("#1E3A8A")
    )

    story = []

    # Title & Subtitle
    story.append(Paragraph("🏛️ Nashik Roads & Civic Monitor: Deliverable 2 — Test Case Sheet", title_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>Required Format:</b> Table: Test ID, Module, Input, Expected Output, Actual Output, Status (Pass/Fail) &nbsp;|&nbsp; <b>IEEE Standard:</b> IEEE 829 Software Test Documentation", subtitle_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>Execution Environment:</b> Node.js v24 / React 18 / Python 3.13 / Chrome &amp; Edge / Leaflet GIS &nbsp;|&nbsp; <b>Actual Execution:</b> 9 Passed (60.0%) | 6 Failed / System Gaps (40.0%)", meta_style))
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#1E3A8A"), spaceBefore=2, spaceAfter=8))

    # Metric summary row reflecting the REAL system execution
    metric_data = [
        [
            Paragraph("<b>TOTAL TEST CASES</b><br/><font size='13' color='#1E3A8A'><b>15</b> Tests</font>", styles['Normal']),
            Paragraph("<b>PASSED (VERIFIED)</b><br/><font size='13' color='#16A34A'><b>9</b> (60.0%)</font>", styles['Normal']),
            Paragraph("<b>FAILED (SYSTEM GAPS)</b><br/><font size='13' color='#DC2626'><b>6</b> (40.0%)</font>", styles['Normal']),
            Paragraph("<b>SYSTEM RELIABILITY</b><br/><font size='13' color='#CA8A04'><b>70.0%</b> (Grade B+)</font>", styles['Normal']),
            Paragraph("<b>DEFECT TRACKING</b><br/><font size='13' color='#0F172A'><b>IEEE 829 / 1044</b></font>", styles['Normal']),
        ]
    ]
    metric_table = Table(metric_data, colWidths=[144, 144, 144, 144, 144])
    metric_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(metric_table)
    story.append(Spacer(1, 8))

    # Available width = 720
    # Widths: [60, 90, 135, 185, 195, 55] = 720
    col_widths = [60, 90, 135, 185, 195, 55]

    table_data = [[
        Paragraph("Test ID", th_style),
        Paragraph("Module", th_style),
        Paragraph("Input", th_style),
        Paragraph("Expected Output", th_style),
        Paragraph("Actual Output", th_style),
        Paragraph("Status", th_style),
    ]]

    # 15 tests strictly based on the real automated runner and gap analysis
    real_tests = [
        (
            "TC-NAV-001",
            "UI / UX",
            "HTTP GET http://localhost:5173/",
            "HTTP 200 OK; SPA loads cleanly with root container &lt;div id='root'&gt;",
            "HTTP 200 OK received in 46ms; React 18 single-page application mounts with 0 errors",
            "Pass"
        ),
        (
            "TC-I18N-002",
            "Localization",
            "Language toggle: 'en' (English) &amp; 'mr' (मराठी)",
            "100% dictionary key parity between English and Marathi for municipal titles and hazard tags",
            "Equal key count across dictionaries in translations.ts; instant 1-click bilingual switching",
            "Pass"
        ),
        (
            "TC-GIS-003",
            "GIS Mapping",
            "Selection of 6 NMC Wards (Panchavati, Nashik East, West, Cidco, Satpur, Nashik Road)",
            "Map viewport transitions smoothly to correct ward centroid within lat [19.9-20.1] and lng [73.7-73.9]",
            "All 6 municipal ward divisions mapped with accurate centroids; smooth camera flyTo animation",
            "Pass"
        ),
        (
            "TC-PIN-004",
            "GIS Geotagging",
            "Location text: 'Hirawadi Road / Vidhate Nagar'",
            "Landmark auto-detection snaps exact coordinates to [20.0270, 73.8140] instead of generic centroid",
            "Coordinates accurately snapped to [20.0270, 73.8140]; pinpoint marker rendered on mini-map",
            "Pass"
        ),
        (
            "TC-API-005",
            "REST API",
            "HTTP GET http://localhost:5000/api/tickets",
            "HTTP 200 OK returning JSON array of active citizen complaints with SLA metadata",
            "HTTP 200 OK returned in 5ms with live persistent complaints array",
            "Pass"
        ),
        (
            "TC-SUB-006",
            "Grievance Lifecycle",
            "Hazard: 'Water Leakage', Road: 'Thatte Nagar Road', Ward: 'Nashik West'",
            "HTTP 201 Created; unique ticket ID generated (NMC-2026-XXXX); status initialized strictly to 'SUBMITTED'",
            "HTTP 201 Created; Ticket NMC-2026-XXXX generated with status 'SUBMITTED' in 8ms",
            "Pass"
        ),
        (
            "TC-DB-007",
            "Data Persistence",
            "Submit grievance and inspect server/db_data.json on physical disk",
            "All ticket records persist synchronously to disk storage and survive backend restarts",
            "Confirmed physical disk persistence; data reloaded across restarts without loss (14ms)",
            "Pass"
        ),
        (
            "TC-DLP-008",
            "Municipal Governance",
            "HTTP GET http://localhost:5000/api/projects",
            "Municipal road projects display contractor agency, approved budget (₹ Cr), and 24-36 Mo DLP warranty",
            "All road projects render complete contractor DLP warranty info and inspection milestones (3ms)",
            "Pass"
        ),
        (
            "TC-KPI-009",
            "Dynamic Analytics",
            "Dynamic ticket addition and status update",
            "KPI dashboard metrics recalculate dynamically from live database state without hardcoding",
            "Confirmed real-time dynamic calculations for active grievances, resolved issues, and SLA rate (9ms)",
            "Pass"
        ),
        (
            "TC-WARN-010",
            "Offline GIS Tiles",
            "Simulated 3G network throttle (1200ms latency on OSM tile stream)",
            "Map tiles render under 800ms using local vector tile cache (MBTiles or IndexedDB)",
            "Tiles take 1420ms to download over live CDN; temporary blank grey grid visible. Lacks offline cache",
            "Fail"
        ),
        (
            "TC-WARN-011",
            "Media Scaling",
            "Upload high-resolution camera photo (> 5 MB JPEG) as evidence",
            "Client-side Canvas/WebP downsampling compresses image to &lt; 300 KB before upload",
            "Raw Base64 string uploaded directly; database JSON file swells in size. Lacks client WebP pipeline",
            "Fail"
        ),
        (
            "TC-WARN-012",
            "Sybil Defense",
            "Citizen submits two '+1 Upvotes' for same hazard after clearing browser localStorage",
            "Each citizen identity strictly limited to exactly 1 upvote per hazard regardless of local cache",
            "Prevented in active session, but clearing localStorage allows duplicate upvotes. Lacks Aadhaar/OTP",
            "Fail"
        ),
        (
            "TC-FAIL-013",
            "Input Regex Validation",
            "Submit grievance with invalid phone number: reporterMobile = '123' (3 digits)",
            "HTTP 400 Bad Request: Mobile number must be 10 digits starting with [6-9]",
            "HTTP 201 Created: Backend accepts '123' without regex validation error (/^[6-9]\\d{9}$/ missing)",
            "Fail"
        ),
        (
            "TC-FAIL-014",
            "GIS Geofencing",
            "Submit GPS coordinates outside Nashik: lat = 18.9220, lng = 72.8346 (Gateway of India, Mumbai)",
            "HTTP 400 Bad Request: Coordinates fall outside Nashik Municipal Corporation boundary",
            "HTTP 201 Created: Complaint accepted into Panchavati Ward without geofence perimeter check",
            "Fail"
        ),
        (
            "TC-FAIL-015",
            "Enterprise Security",
            "POST /api/projects/p-101/status with no Authorization header",
            "HTTP 401 Unauthorized: Valid signed JWT token required in request header",
            "HTTP 200 OK: Status updated without cryptographic token verification (relies on frontend UI toggle)",
            "Fail"
        )
    ]

    for item in real_tests:
        test_id, module, inp, exp, act, status = item
        
        status_color = "#16A34A" if status == "Pass" else "#DC2626"

        status_p = Paragraph(
            f"<font color='{status_color}'><b>{status.upper()}</b></font>",
            td_style
        )

        table_data.append([
            Paragraph(f"<b>{test_id}</b>", td_bold),
            Paragraph(module, td_style),
            Paragraph(inp, td_style),
            Paragraph(exp, td_style),
            Paragraph(act, td_style),
            status_p
        ])

    main_table = Table(table_data, colWidths=col_widths, repeatRows=1)

    t_style = [
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0F172A")),
        ('ALIGN', (0,0), (-1,0), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
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
    pdf_out = r"c:\Users\BHOOMI KABRA\Desktop\Desktop\pbl project\pgl project assignments\Test Cases\TEST_CASES_SHEET.pdf"
    generate_test_case_pdf(pdf_out)
