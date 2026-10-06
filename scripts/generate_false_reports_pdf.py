import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
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
        self.setFont("Helvetica", 8.5)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header (pages after first)
        if self._pageNumber > 1:
            self.drawString(54, 750, "🏛️ Nashik Roads & Civic Monitor — Anti-Fraud & False Report Precautions Guide")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(54, 744, 558, 744)

        # Footer
        footer_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 30, footer_text)
        self.drawString(54, 30, "Nashik Municipal Corporation (NMC) — PBL Project Quality & Integrity Specification")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, 42, 558, 42)
        self.restoreState()

def build_pdf(output_pdf_path):
    # Portrait Letter: 612 x 792 pt. Margins: 54 pt (0.75 in)
    doc = SimpleDocTemplate(
        output_pdf_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#1E3A8A"),
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#475569"),
        spaceAfter=8
    )

    h2_style = ParagraphStyle(
        'Header2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#0F172A"),
        spaceBefore=12,
        spaceAfter=4
    )

    h3_style = ParagraphStyle(
        'Header3',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor("#1E40AF"),
        spaceBefore=6,
        spaceAfter=2
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=colors.HexColor("#334155")
    )

    bullet_style = ParagraphStyle(
        'Bullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        leftIndent=12,
        textColor=colors.HexColor("#1E293B")
    )

    callout_style = ParagraphStyle(
        'Callout',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#92400E")
    )

    viva_q = ParagraphStyle(
        'VivaQ',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#1E3A8A")
    )

    viva_a = ParagraphStyle(
        'VivaA',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#0F172A")
    )

    story = []

    # Title & Metadata
    story.append(Paragraph("🛡️ Anti-Fraud &amp; False Report Prevention Guide", title_style))
    story.append(Paragraph("<b>Project:</b> Nashik Roads &amp; Civic Monitor &nbsp;|&nbsp; <b>Topic:</b> Handling Fake / Misleading Civic Complaints", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#1E3A8A"), spaceBefore=2, spaceAfter=8))

    # Summary Box
    summary_data = [
        [
            Paragraph("<b>THE PROBLEM:</b> Municipal portals get flooded with fake photos from the internet, duplicate complaints for the same pothole, or complaints outside city limits.", callout_style)
        ],
        [
            Paragraph("<b>OUR SOLUTION:</b> A 4-Tier Defense Pipeline: Legal Accountability + Landmark Geotag Snapping + Community Peer Review Flagging + 'Closed != Resolved' Contractor Proof.", callout_style)
        ]
    ]
    summary_table = Table(summary_data, colWidths=[504])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FEF3C7")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#F59E0B")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#FDE68A")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 8))

    # Section 1: The Problem
    story.append(Paragraph("1. Why False Reports Happen in Municipal Platforms", h2_style))
    story.append(Paragraph(
        "In real municipal corporations like Nashik (NMC), civic apps face four major integrity risks if precautions are not taken:",
        body_style
    ))
    story.append(Spacer(1, 3))

    risks = [
        ("Fake / Downloaded Photos:", "Users download an old photo of a flooded road from Google and report it to cause panic or defame the municipal council."),
        ("Duplicate Reports (Spam):", "Ten different people walking past the same pothole on Gangapur Road file 10 separate complaints, wasting ward engineer inspection time."),
        ("Out-of-Boundary Submissions:", "A user in Mumbai or Pune files a complaint using coordinates outside Nashik city limits."),
        ("Contractor Fake Closures:", "Contractors mark a project as 'Resolved' in the software without actually repairing the road on the ground.")
    ]
    for r_title, r_desc in risks:
        story.append(Paragraph(f"<b>• {r_title}</b> {r_desc}", bullet_style))
        story.append(Spacer(1, 2))

    story.append(Spacer(1, 6))

    # Section 2: What We Currently Do (Active in Code)
    story.append(Paragraph("2. Precautions Currently Active in Our Project", h2_style))
    story.append(Paragraph(
        "Our project includes four active safeguards in the running frontend and backend:",
        body_style
    ))
    story.append(Spacer(1, 3))

    current_safeguards = [
        ("Safeguard 1: Mandatory Legal Anti-Fraud Declaration (Section 396 MMC Act)",
         "In the grievance modal (ComplaintFormModal.tsx), a user must check a legal declaration: <i>'I solemnly certify that this road problem is genuine. I understand that submitting fake or downloaded pictures is a punishable offense under Section 396 of the Maharashtra Municipal Corporation Act &amp; IT Act 2000.'</i>"),
        ("Safeguard 2: Exact Landmark Snapping & GPS Detection",
         "The app features a 'My GPS Location' button and an exact landmark dictionary (LANDMARK_COORDINATES). Users cannot type arbitrary locations; typing 'Hirawadi Road' instantly snaps coordinates to [20.0270, 73.8140]."),
        ("Safeguard 3: Community Peer-Review Flagging ('Flag as False Report')",
         "Every ticket card in the Citizen Feed has a 'Flag as False Report' button. If local residents see an inaccurate report, they flag it with reasons ('Already repaired', 'Fake photo', 'Wrong spot'). When flagged, the post displays an immediate warning banner: <i>'⚠️ Community Alert: Suspected False or Duplicate'</i> and moves to the 'Flagged for Review' tab."),
        ("Safeguard 4: 'Closed != Resolved' Contractor Fraud Prevention",
         "Contractors cannot unilaterally close complaints. The VerificationTracker.tsx engine requires side-by-side Before Repair vs. After Repair photographic evidence, and only the citizen reporter has the authority to verify and close the ticket.")
    ]

    for s_title, s_desc in current_safeguards:
        story.append(Paragraph(f"<b>• {s_title}</b>", h3_style))
        story.append(Paragraph(s_desc, bullet_style))
        story.append(Spacer(1, 2))

    story.append(Spacer(1, 6))

    # Section 3: The Complete Future Roadmap
    story.append(Paragraph("3. The Proper Industry Solution (Phase-2 Architecture)", h2_style))
    story.append(Paragraph(
        "To make the system 100% immune to fraud in enterprise production, we propose the following 5-Pillar Architecture:",
        body_style
    ))
    story.append(Spacer(1, 4))

    roadmap_data = [
        [
            Paragraph("<b>Integrity Pillar</b>", ParagraphStyle('TH', fontName='Helvetica-Bold', fontSize=8, textColor=colors.white)),
            Paragraph("<b>Technology / Algorithm</b>", ParagraphStyle('TH', fontName='Helvetica-Bold', fontSize=8, textColor=colors.white)),
            Paragraph("<b>How It Stops False Reports in Simple Words</b>", ParagraphStyle('TH', fontName='Helvetica-Bold', fontSize=8, textColor=colors.white)),
        ],
        [
            Paragraph("<b>1. EXIF Metadata Camera Lock</b>", body_style),
            Paragraph("HTML5 FileReader + EXIF.js parser", body_style),
            Paragraph("Extracts GPS and timestamp hidden inside the photo file. Rejects screenshots and images without camera metadata (blocks Google downloads).", body_style),
        ],
        [
            Paragraph("<b>2. Spatial Proximity Clustering</b>", body_style),
            Paragraph("PostGIS <code>ST_DWithin(20m)</code>", body_style),
            Paragraph("If a new complaint is filed within 20 meters of an existing pothole, the system auto-merges it into a '+1 Upvote' instead of a duplicate ticket.", body_style),
        ],
        [
            Paragraph("<b>3. Mobile OTP Rate-Limiting</b>", body_style),
            Paragraph("Twilio / Indian SMS Gateway", body_style),
            Paragraph("Requires a 4-digit SMS OTP on registration. Limits each phone number to max 3 complaints per day to prevent spam bots.", body_style),
        ],
        [
            Paragraph("<b>4. Perceptual Image Hashing (pHash)</b>", body_style),
            Paragraph("ImageHash / Hamming Distance", body_style),
            Paragraph("Computes a fingerprint of every uploaded image. If the exact same photo is used across multiple complaints, it is blocked.", body_style),
        ],
        [
            Paragraph("<b>5. Civic Karma Trust Score</b>", body_style),
            Paragraph("Citizen Reputation Algorithm", body_style),
            Paragraph("Citizens whose reports are verified gain trust score. Users with multiple flagged false reports have their accounts quarantined.", body_style),
        ],
    ]

    roadmap_table = Table(roadmap_data, colWidths=[120, 130, 254])
    roadmap_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0F172A")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor("#F8FAFC")),
        ('BACKGROUND', (0,3), (-1,3), colors.HexColor("#F8FAFC")),
        ('BACKGROUND', (0,5), (-1,5), colors.HexColor("#F8FAFC")),
    ]))
    story.append(roadmap_table)
    story.append(Spacer(1, 8))

    # Section 4: Viva Defense Guide (How to answer Sir)
    story.append(Paragraph("4. Professor Viva Defense Guide (Exact Words to Say to Sir)", h2_style))
    story.append(Spacer(1, 3))

    viva_qa = [
        ("Sir asks: 'What if someone uploads a downloaded image of a pothole from Google?'",
         "Answer: 'Sir, currently we require a mandatory legal certification under Section 396 MMC Act, and local residents can click Flag as False Report to immediately mark the ticket for inspection. In Phase-2, we have designed an EXIF metadata scanner that verifies camera hardware tags and live GPS coordinates embedded inside the photo, automatically rejecting downloaded images.'"),
        ("Sir asks: 'What if 10 people report the exact same road damage?'",
         "Answer: 'Sir, our Social Feed provides a +1 I Face This upvoting mechanism. In our database roadmap, we use Spatial Proximity Clustering (within 20 meters), which automatically links nearby complaints to the primary ticket and converts them into upvotes instead of creating duplicate repair orders.'"),
        ("Sir asks: 'What if a contractor marks a complaint as Resolved without doing any work?'",
         "Answer: 'Sir, this is our core innovation: Closed != Resolved. A contractor cannot close a complaint unilaterally. They must upload an After Repair geotagged photo, and the ticket enters PENDING_VERIFICATION. Only the original citizen reporter has the digital sign-off authority to confirm and officially close the ticket.'")
    ]

    for q, a in viva_qa:
        story.append(Paragraph(f"<b>❓ {q}</b>", viva_q))
        story.append(Spacer(1, 1))
        story.append(Paragraph(f"<b>💡 {a}</b>", viva_a))
        story.append(Spacer(1, 5))

    # Build PDF
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF: {output_pdf_path}")

if __name__ == '__main__':
    pdf_path = r"c:\Users\BHOOMI KABRA\Desktop\Desktop\pbl project\pgl project assignments\Reports\FALSE_REPORTS_AND_PRECAUTIONS_GUIDE.pdf"
    build_pdf(pdf_path)
