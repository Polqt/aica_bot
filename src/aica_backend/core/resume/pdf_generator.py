from typing import List
from io import BytesIO
import logging

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.enums import TA_CENTER, TA_LEFT

from database.models.user_models import UserProfile, UserEducation, UserExperience, UserSkill

logger = logging.getLogger(__name__)


class ResumePDFGenerator:
    
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):

        style_names = [style.name for style in self.styles.byName.values()]
        
        # Name Style - Large, bold, centered
        if 'ResumeName' not in style_names:
            self.styles.add(ParagraphStyle(
                name='ResumeName',
                parent=self.styles['Heading1'],
                fontSize=18,
                textColor=colors.black,
                spaceAfter=4,
                alignment=TA_CENTER,
                fontName='Helvetica-Bold',
                leading=22
            ))
        
        # Contact Info Style - Small, centered
        if 'ContactInfo' not in style_names:
            self.styles.add(ParagraphStyle(
                name='ContactInfo',
                parent=self.styles['Normal'],
                fontSize=9,
                textColor=colors.black,
                alignment=TA_CENTER,
                spaceAfter=12,
                fontName='Helvetica'
            ))
        
        # Section Header Style - Bold, underlined look
        if 'SectionHeader' not in style_names:
            self.styles.add(ParagraphStyle(
                name='SectionHeader',
                parent=self.styles['Heading2'],
                fontSize=10,
                textColor=colors.black,
                spaceAfter=4,
                spaceBefore=10,
                fontName='Helvetica-Bold',
                alignment=TA_LEFT,
                leading=13
            ))
        
        # Job Title / Position Style - Bold
        if 'JobTitle' not in style_names:
            self.styles.add(ParagraphStyle(
                name='JobTitle',
                parent=self.styles['Normal'],
                fontSize=9,
                textColor=colors.black,
                fontName='Helvetica-Bold',
                spaceAfter=2,
                leading=11
            ))
        
        # Company/Institution Style - Italic
        if 'Organization' not in style_names:
            self.styles.add(ParagraphStyle(
                name='Organization',
                parent=self.styles['Normal'],
                fontSize=9,
                textColor=colors.black,
                fontName='Helvetica-Oblique',
                spaceAfter=2,
                leading=11
            ))
        
        # Date Style - Italic
        if 'DateRange' not in style_names:
            self.styles.add(ParagraphStyle(
                name='DateRange',
                parent=self.styles['Normal'],
                fontSize=9,
                textColor=colors.black,
                fontName='Helvetica-Oblique',
                spaceAfter=4,
                leading=11
            ))
        
        # Body Text Style
        if 'BodyText' not in style_names:
            self.styles.add(ParagraphStyle(
                name='BodyText',
                parent=self.styles['Normal'],
                fontSize=9,
                textColor=colors.black,
                spaceAfter=4,
                leading=11,
                leftIndent=15
            ))
        
        # Placeholder Style - Italic, gray
        if 'Placeholder' not in style_names:
            self.styles.add(ParagraphStyle(
                name='Placeholder',
                parent=self.styles['Normal'],
                fontSize=9,
                textColor=colors.HexColor('#666666'),
                fontName='Helvetica-Oblique',
                spaceAfter=4,
                leading=11,
                leftIndent=15
            ))
    
    def generate_resume_pdf(
        self,
        profile: UserProfile,
        education: List[UserEducation],
        experience: List[UserExperience],
        skills: List[UserSkill],
        user_email: str = None
    ) -> BytesIO:
        try:
            buffer = BytesIO()
            doc = SimpleDocTemplate(
                buffer,
                pagesize=letter,
                rightMargin=0.8*inch,
                leftMargin=0.8*inch,
                topMargin=0.7*inch,
                bottomMargin=0.7*inch
            )
            
            story = []
            
            # Header Section
            story.extend(self._build_header(profile, user_email))
            
            # ALWAYS include Technical Skills Section
            story.extend(self._build_skills_section(skills))
            
            # ALWAYS include Experience Section
            story.extend(self._build_experience_section(experience))
            
            # ALWAYS include Project Section
            story.extend(self._build_project_section())
            
            # ALWAYS include Education Section
            story.extend(self._build_education_section(education))
            
            # ALWAYS include Achievements Section
            story.extend(self._build_achievements_section())
            
            # Build PDF
            doc.build(story)
            buffer.seek(0)
            
            logger.info(f"Successfully generated PDF resume for user {profile.user_id}")
            return buffer
            
        except Exception as e:
            logger.error(f"Failed to generate PDF resume: {str(e)}")
            raise
    
    def _build_header(self, profile: UserProfile, user_email: str = None) -> List:
        elements = []
        
        # Name (uppercase, centered, bold)
        name = profile.full_name or "[YOUR FULL NAME]"
        elements.append(Paragraph(name.upper(), self.styles['ResumeName']))
        
        # Contact line: LinkedIn URL | Phone | Email (centered)
        contact_parts = []
        
        # LinkedIn URL
        if profile.linkedin_url:
            linkedin_link = f'<link href="{profile.linkedin_url}" color="blue"><u>{profile.linkedin_url}</u></link>'
            contact_parts.append(linkedin_link)
        else:
            contact_parts.append('<i>[LinkedIn URL]</i>')
        
        # Phone
        if profile.phone:
            contact_parts.append(profile.phone)
        else:
            contact_parts.append('<i>[Contact Number]</i>')
        
        # Email
        if user_email:
            email_link = f'<link href="mailto:{user_email}" color="blue"><u>{user_email}</u></link>'
            contact_parts.append(email_link)
        else:
            contact_parts.append('<i>[Email]</i>')
        
        # Join with " | " separator
        contact_line = ' | '.join(contact_parts)
        elements.append(Paragraph(contact_line, self.styles['ContactInfo']))
        
        elements.append(Spacer(1, 0.15*inch))
        
        return elements
    
    def _build_skills_section(self, skills: List[UserSkill]) -> List:
        elements = []
        
        # Section header with underline
        elements.append(Paragraph("<b>TECHNICAL SKILLS</b>", self.styles['SectionHeader']))
        elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.black, spaceAfter=6))
        
        if not skills or len(skills) == 0:
            # Placeholders when no skills
            elements.append(Paragraph(
                "• <b>Frontend:</b> <i>[Add your frontend technologies like HTML, CSS, JavaScript, React, Vue.js, etc.]</i>",
                self.styles['Placeholder']
            ))
            elements.append(Paragraph(
                "• <b>Backend:</b> <i>[Add your backend technologies like Node.js, Python, PHP, Java, etc.]</i>",
                self.styles['Placeholder']
            ))
            elements.append(Paragraph(
                "• <b>Database Management:</b> <i>[Add your database skills like MySQL, PostgreSQL, MongoDB, etc.]</i>",
                self.styles['Placeholder']
            ))
            elements.append(Paragraph(
                "• <b>Tools:</b> <i>[Add your development tools like Git, Docker, Figma, Jira, etc.]</i>",
                self.styles['Placeholder']
            ))
        else:
            # Categorize skills intelligently
            frontend_skills = []
            backend_skills = []
            database_skills = []
            tool_skills = []
            other_skills = []
            
            for skill in skills:
                skill_lower = skill.skill_name.lower()
                
                # Frontend detection
                if any(term in skill_lower for term in [
                    'html', 'css', 'javascript', 'react', 'vue', 'angular', 'typescript', 
                    'next', 'svelte', 'jquery', 'bootstrap', 'tailwind', 'sass', 'less'
                ]):
                    frontend_skills.append(skill.skill_name)
                # Backend detection
                elif any(term in skill_lower for term in [
                    'node', 'python', 'java', 'php', 'ruby', 'go', 'rust', 'c++', 'c#',
                    'express', 'flask', 'django', 'spring', 'laravel', 'rails', '.net'
                ]):
                    backend_skills.append(skill.skill_name)
                # Database detection
                elif any(term in skill_lower for term in [
                    'sql', 'mysql', 'postgres', 'mongo', 'redis', 'firebase', 'supabase',
                    'database', 'db', 'mariadb', 'oracle', 'dynamodb', 'cassandra'
                ]):
                    database_skills.append(skill.skill_name)
                # Tools detection
                elif any(term in skill_lower for term in [
                    'git', 'docker', 'kubernetes', 'jenkins', 'figma', 'photoshop', 
                    'jira', 'postman', 'vercel', 'aws', 'azure', 'gcp', 'linux', 'webpack'
                ]):
                    tool_skills.append(skill.skill_name)
                else:
                    other_skills.append(skill.skill_name)
            
            # Display categorized skills
            if frontend_skills:
                skills_text = ", ".join(frontend_skills)
                elements.append(Paragraph(f"• <b>Frontend:</b> {skills_text}", self.styles['BodyText']))
            
            if backend_skills:
                skills_text = ", ".join(backend_skills)
                elements.append(Paragraph(f"• <b>Backend:</b> {skills_text}", self.styles['BodyText']))
            
            if database_skills:
                skills_text = ", ".join(database_skills)
                elements.append(Paragraph(f"• <b>Database Management:</b> {skills_text}", self.styles['BodyText']))
            
            if tool_skills:
                skills_text = ", ".join(tool_skills)
                elements.append(Paragraph(f"• <b>Tools:</b> {skills_text}", self.styles['BodyText']))
            
            if other_skills:
                skills_text = ", ".join(other_skills)
                elements.append(Paragraph(f"• <b>Other Technologies:</b> {skills_text}", self.styles['BodyText']))
        
        elements.append(Spacer(1, 0.12*inch))
        return elements
    
    def _build_experience_section(self, experience: List[UserExperience]) -> List:
        elements = []
        
        # Section header with underline
        elements.append(Paragraph("<b>EXPERIENCE</b>", self.styles['SectionHeader']))
        elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.black, spaceAfter=6))
        
        if not experience or len(experience) == 0:
            # Placeholder when no experience
            elements.append(Paragraph(
                "<b>[Job Title, Company Name]</b>",
                self.styles['JobTitle']
            ))
            elements.append(Paragraph(
                "<i>[Month Year – Month Year]</i>",
                self.styles['DateRange']
            ))
            elements.append(Paragraph(
                "• <i>[Describe your key responsibilities and achievements in this role]</i>",
                self.styles['Placeholder']
            ))
            elements.append(Paragraph(
                "• <i>[Add specific projects, technologies used, and impact made]</i>",
                self.styles['Placeholder']
            ))
            elements.append(Paragraph(
                "• <i>[Include metrics or quantifiable results where possible]</i>",
                self.styles['Placeholder']
            ))
        else:
            for exp in experience:
                # Job Title and Company
                job_title = exp.job_title or "[Job Title]"
                company = exp.company_name or "[Company Name]"
                
                elements.append(Paragraph(
                    f"<b>{job_title}, {company}</b>",
                    self.styles['JobTitle']
                ))
                
                # Date Range
                date_text = ""
                if exp.start_date:
                    date_text = exp.start_date
                else:
                    date_text = "[Start Date]"
                
                if exp.is_current:
                    date_text += " – Present"
                elif exp.end_date:
                    date_text += f" – {exp.end_date}"
                else:
                    date_text += " – [End Date]"
                
                elements.append(Paragraph(f"<i>{date_text}</i>", self.styles['DateRange']))
                
                # Description
                if exp.description and exp.description.strip():
                    # Split description into bullet points
                    desc_parts = exp.description.split('\n')
                    for part in desc_parts:
                        if part.strip():
                            bullet_text = part.strip()
                            if not bullet_text.startswith('•'):
                                bullet_text = f"• {bullet_text}"
                            elements.append(Paragraph(bullet_text, self.styles['BodyText']))
                else:
                    elements.append(Paragraph(
                        "• <i>[Describe your responsibilities and achievements here]</i>",
                        self.styles['Placeholder']
                    ))
                
                elements.append(Spacer(1, 0.08*inch))
        
        elements.append(Spacer(1, 0.08*inch))
        return elements
    
    def _build_project_section(self) -> List:
        elements = []
        
        # Section header with underline
        elements.append(Paragraph("<b>PROJECT</b>", self.styles['SectionHeader']))
        elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.black, spaceAfter=6))
        
        # Placeholder
        elements.append(Paragraph(
            "<b>[Project Name]:</b> <i>[Brief project description]</i>",
            self.styles['Placeholder']
        ))
        elements.append(Paragraph(
            "• <i>[Key features and technologies used in the project]</i>",
            self.styles['Placeholder']
        ))
        elements.append(Paragraph(
            "• <i>[Your role and contributions to the project]</i>",
            self.styles['Placeholder']
        ))
        elements.append(Paragraph(
            "• <i>[Project outcomes, impact, or recognition received]</i>",
            self.styles['Placeholder']
        ))
        
        elements.append(Spacer(1, 0.12*inch))
        return elements
    
    def _build_education_section(self, education: List[UserEducation]) -> List:
        elements = []
        
        # Section header with underline
        elements.append(Paragraph("<b>EDUCATIONS</b>", self.styles['SectionHeader']))
        elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.black, spaceAfter=6))
        
        if not education or len(education) == 0:
            # Placeholder when no education
            elements.append(Paragraph(
                "<b>[University/College Name]</b>",
                self.styles['JobTitle']
            ))
            elements.append(Paragraph(
                "<i>[Degree Type] in [Field of Study]</i>",
                self.styles['Organization']
            ))
            elements.append(Paragraph(
                "<i>[Graduation Year or Expected Year]</i>",
                self.styles['DateRange']
            ))
            elements.append(Paragraph(
                "<i>[Location]</i>",
                self.styles['DateRange']
            ))
        else:
            for edu in education:
                # University name
                institution = edu.institution_name or "[Institution Name]"
                elements.append(Paragraph(f"<b>{institution}</b>", self.styles['JobTitle']))
                
                # Degree and field
                degree = edu.degree_type or "[Degree Type]"
                field = edu.field_of_study
                if field:
                    degree_text = f"{degree} in {field}"
                else:
                    degree_text = degree
                elements.append(Paragraph(f"<i>{degree_text}</i>", self.styles['Organization']))
                
                # Date range
                date_text = ""
                if edu.start_date and edu.end_date:
                    date_text = f"{edu.start_date} – {edu.end_date}"
                elif edu.start_date:
                    date_text = f"{edu.start_date} – Present" if edu.is_current else edu.start_date
                else:
                    date_text = "[Year Range]"
                
                elements.append(Paragraph(date_text, self.styles['DateRange']))
                
                elements.append(Spacer(1, 0.06*inch))
        
        elements.append(Spacer(1, 0.08*inch))
        return elements
    
    def _build_achievements_section(self) -> List:
        elements = []
        
        # Section header with underline
        elements.append(Paragraph("<b>ACHIEVEMENTS</b>", self.styles['SectionHeader']))
        elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.black, spaceAfter=6))
        
        # Placeholder
        elements.append(Paragraph(
            "• <b>[Achievement Title]</b> – <i>[Organization/Event Name]</i>",
            self.styles['Placeholder']
        ))
        elements.append(Paragraph(
            "• <b>[Award or Recognition]</b> – <i>[Details about the achievement]</i>",
            self.styles['Placeholder']
        ))
        
        elements.append(Spacer(1, 0.08*inch))
        return elements


def generate_resume_pdf(
    profile: UserProfile,
    education: List[UserEducation],
    experience: List[UserExperience],
    skills: List[UserSkill],
    user_email: str = None
) -> BytesIO:
    generator = ResumePDFGenerator()
    return generator.generate_resume_pdf(profile, education, experience, skills, user_email)
