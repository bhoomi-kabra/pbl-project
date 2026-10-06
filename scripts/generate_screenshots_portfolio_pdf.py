import os
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak, HRFlowable
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
        self.setFont("Helvetica", 8.5)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header (on pages after first)
        if self._pageNumber > 1:
            self.drawString(36, 580, "🏛️ Nashik Roads & Civic Monitor — Deliverable 5: Tested Functionality Screenshots")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(36, 574, 756, 574)

        # Footer
        footer_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(756, 22, footer_text)
        self.drawString(36, 22, "Nashik Municipal Corporation (NMC) — PBL Deliverable 5: Updated Functional Screenshots")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(36, 32, 756, 32)
        self.restoreState()

def build_screenshots_pdf(output_pdf_path):
    # Landscape Letter: 792 x 612 pt
    doc = SimpleDocTemplate(
        output_pdf_path,
        pagesize=landscape(letter),
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=38
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

    fig_title_style = ParagraphStyle(
        'FigTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor("#0F172A")
    )

    fig_desc_style = ParagraphStyle(
        'FigDesc',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor("#334155")
    )

    story = []

    # Title Banner
    story.append(Paragraph("🏛️ Nashik Roads &amp; Civic Monitor: Deliverable 5 — Updated Functional Screenshots", title_style))
    story.append(Spacer(1, 3))
    story.append(Paragraph("<b>Submission Format:</b> Screenshots reflecting current, tested functionality across all municipal modules &nbsp;|&nbsp; <b>Status:</b> 100% Live &amp; Verified", subtitle_style))
    story.append(Spacer(1, 4))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#1E3A8A"), spaceBefore=2, spaceAfter=8))

    screenshots = [
        (
            "Figure 1: Citizen Social Media & Grievance Feed",
            "c:\\Users\\BHOOMI KABRA\\Desktop\\Desktop\\pbl project\\pgl project assignments\\Design Screenshots\\01_citizen_social_feed.png",
            "Live mobile-first citizen feed displaying real submitted grievances (e.g., Ticket NMC-2026-4009 by Bhoomi Kabra), +1 community upvoting, social media sharing (WhatsApp, Twitter/X), and anti-fraud status verification."
        ),
        (
            "Figure 2: Interactive Leaflet GIS Road Infrastructure Map",
            "c:\\Users\\BHOOMI KABRA\\Desktop\\Desktop\\pbl project\\pgl project assignments\\Design Screenshots\\02_interactive_gis_map.png",
            "High-precision Leaflet map centered on Nashik with 17 active markers (12 citizen complaints in blue/orange and 5 road works in yellow/green/red), real-time database sync badge, and 6-ward dropdown filter."
        ),
        (
            "Figure 3: Citizen Grievance Modal with Exact Landmark Snapping",
            "c:\\Users\\BHOOMI KABRA\\Desktop\\Desktop\\pbl project\\pgl project assignments\\Design Screenshots\\03_complaint_modal_landmark_snapping.png",
            "Demonstrates instant landmark snapping for 'Hirawadi Road / Vidhate Nagar' with popular Panchavati spot suggestions, Indian 10-digit mobile contact validation, and camera photo downsampling."
        ),
        (
            "Figure 4: AI-Assisted Smart Grievance Chatbot Assistant",
            "c:\\Users\\BHOOMI KABRA\\Desktop\\Desktop\\pbl project\\pgl project assignments\\Design Screenshots\\04_ai_smart_chatbot.png",
            "Conversational NLP hazard classification assistant with quick hazard suggestion chips ('Sparking Wire near K.K. Wagh') and 1-click modal pre-fill deep linking."
        ),
        (
            "Figure 5: 'Closed != Resolved' Citizen Verification Audit Engine",
            "c:\\Users\\BHOOMI KABRA\\Desktop\\Desktop\\pbl project\\pgl project assignments\\Design Screenshots\\05_verification_tracker_audit.png",
            "Enforces citizen accountability. Displays side-by-side Before Repair (Citizen Geotagged) vs After Repair (Municipal Contractor Proof) with reporter-only signature sign-off."
        ),
        (
            "Figure 6: Municipal Admin Control Center & Resolution Workflow",
            "c:\\Users\\BHOOMI KABRA\\Desktop\\Desktop\\pbl project\\pgl project assignments\\Design Screenshots\\06_municipal_admin_dashboard.png",
            "Executive municipal officer view (Er. M. S. Patil) showing ward-wise complaint escalation queues, department routing, and 'Upload Resolution Proof' contractor compliance buttons."
        )
    ]

    for title, img_path, desc in screenshots:
        if os.path.exists(img_path):
            story.append(Paragraph(f"<b>{title}</b>", fig_title_style))
            story.append(Paragraph(desc, fig_desc_style))
            story.append(Spacer(1, 4))
            
            # Width = 700 pt, Height = 360 pt (keeps 16:9 ratio, fits on page cleanly)
            img = Image(img_path, width=700, height=360)
            story.append(img)
            story.append(PageBreak())

    # Build PDF
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated Deliverable 5 PDF: {output_pdf_path}")

if __name__ == '__main__':
    pdf_out = r"c:\Users\BHOOMI KABRA\Desktop\Desktop\pbl project\pgl project assignments\Design Screenshots\UPDATED_SCREENSHOTS_PORTFOLIO.pdf"
    build_screenshots_pdf(pdf_out)
