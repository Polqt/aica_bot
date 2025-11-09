"""
Test Resume Extraction Script

This script tests resume extraction on PDF files directly without uploading through the UI.
It processes all resumes in the resumes folder and outputs detailed extraction results.
"""
import os
import sys
import asyncio
import json
from pathlib import Path
from typing import Dict, Any
import logging

# Add parent directory to path to import from core
sys.path.insert(0, str(Path(__file__).parent.parent))

from core.resume.parser import ResumeParser
from core.resume.models import ParsedResume

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ResumeExtractionTester:
    """Tests resume extraction accuracy across multiple resume formats."""
    
    def __init__(self, resumes_dir: str = None):
        """
        Initialize the tester.
        
        Args:
            resumes_dir: Path to directory containing resume files. 
                        Defaults to project root resumes folder.
        """
        if resumes_dir is None:
            # Default to resumes folder in project root
            project_root = Path(__file__).parent.parent.parent.parent
            resumes_dir = project_root / "resumes"
        
        self.resumes_dir = Path(resumes_dir)
        self.parser = ResumeParser()
        
        if not self.resumes_dir.exists():
            raise ValueError(f"Resumes directory not found: {self.resumes_dir}")
        
        logger.info(f"Initialized tester with resumes directory: {self.resumes_dir}")
    
    def get_resume_files(self) -> list:
        """Get all PDF resume files from the resumes directory."""
        pdf_files = list(self.resumes_dir.glob("*.pdf"))
        logger.info(f"Found {len(pdf_files)} resume files")
        return pdf_files
    
    async def extract_from_file(self, file_path: Path) -> Dict[str, Any]:
        """
        Extract information from a single resume file.
        
        Args:
            file_path: Path to the resume PDF file
            
        Returns:
            Dictionary with extraction results and metadata
        """
        try:
            logger.info(f"\n{'='*80}")
            logger.info(f"Processing: {file_path.name}")
            logger.info(f"{'='*80}")
            
            # Read file content
            with open(file_path, 'rb') as f:
                file_content = f.read()
            
            # Determine file type (MIME type)
            extension = file_path.suffix.lower()
            mime_type_map = {
                '.pdf': 'application/pdf',
                '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                '.doc': 'application/msword'
            }
            file_type = mime_type_map.get(extension, 'application/pdf')
            
            # Parse resume
            parsed_resume: ParsedResume = await self.parser.parse_resume_from_file(
                file_content, 
                file_type
            )
            
            result = {
                "filename": file_path.name,
                "status": "success",
                "personal_info": {
                    "full_name": parsed_resume.personal_info.full_name,
                    "email": parsed_resume.personal_info.email,
                    "phone": parsed_resume.personal_info.phone,
                    "location": parsed_resume.personal_info.location,
                    "linkedin": parsed_resume.personal_info.linkedin
                },
                "skills": {
                    "technical_skills": parsed_resume.skills.technical_skills,
                    "soft_skills": parsed_resume.skills.soft_skills,
                    "experience_years": parsed_resume.skills.experience_years,
                    "education_level": parsed_resume.skills.education_level,
                    "industries": parsed_resume.skills.industries,
                    "job_titles": parsed_resume.skills.job_titles
                },
                "text_preview": {
                    "raw_text_first_800_chars": parsed_resume.raw_text[:800],
                    "cleaned_text_length": len(parsed_resume.cleaned_text),
                    "raw_text_length": len(parsed_resume.raw_text)
                }
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Error processing {file_path.name}: {str(e)}", exc_info=True)
            return {
                "filename": file_path.name,
                "status": "error",
                "error": str(e)
            }
    
    def print_result(self, result: Dict[str, Any]):
        """Print extraction results in a readable format."""
        print(f"\n{'='*80}")
        print(f"FILE: {result['filename']}")
        print(f"{'='*80}")
        print(f"Status: {result['status']}")
        
        if result['status'] == 'error':
            print(f"❌ Error: {result['error']}")
            return
        
        # Personal Information
        print(f"\n📋 PERSONAL INFORMATION")
        print(f"{'─'*80}")
        personal = result['personal_info']
        print(f"  Full Name:    {personal['full_name'] or '❌ Not extracted'}")
        print(f"  Email:        {personal['email'] or '❌ Not extracted'}")
        print(f"  Phone:        {personal['phone'] or '❌ Not extracted'}")
        print(f"  Location:     {personal['location'] or '❌ Not extracted'}")
        print(f"  LinkedIn:     {personal['linkedin'] or '❌ Not extracted'}")
        
        # Skills
        print(f"\n🛠️  SKILLS EXTRACTION")
        print(f"{'─'*80}")
        skills = result['skills']
        
        print(f"  Technical Skills ({len(skills['technical_skills'])} found):")
        if skills['technical_skills']:
            # Group by category for better readability
            print(f"    {', '.join(skills['technical_skills'][:20])}")
            if len(skills['technical_skills']) > 20:
                print(f"    ... and {len(skills['technical_skills']) - 20} more")
        else:
            print(f"    ❌ No technical skills extracted")
        
        print(f"\n  Soft Skills ({len(skills['soft_skills'])} found):")
        if skills['soft_skills']:
            print(f"    {', '.join(skills['soft_skills'][:15])}")
            if len(skills['soft_skills']) > 15:
                print(f"    ... and {len(skills['soft_skills']) - 15} more")
        else:
            print(f"    ❌ No soft skills extracted")
        
        print(f"\n  Experience:      {skills['experience_years']} years" if skills['experience_years'] else "  Experience:      ❌ Not determined")
        print(f"  Education:       {skills['education_level'] or '❌ Not determined'}")
        print(f"  Industries:      {', '.join(skills['industries']) if skills['industries'] else '❌ Not identified'}")
        print(f"  Job Titles:      {', '.join(skills['job_titles']) if skills['job_titles'] else '❌ Not identified'}")
        
        # Text preview
        print(f"\n📄 TEXT EXTRACTION")
        print(f"{'─'*80}")
        preview = result['text_preview']
        print(f"  Raw text length:     {preview['raw_text_length']} characters")
        print(f"  Cleaned text length: {preview['cleaned_text_length']} characters")
        print(f"\n  First 800 characters (for name verification):")
        print(f"  {'-'*76}")
        print(f"  {preview['raw_text_first_800_chars'][:800]}")
        print(f"  {'-'*76}")
    
    async def test_all_resumes(self, save_to_file: bool = True):
        """
        Test extraction on all resume files and generate a report.
        
        Args:
            save_to_file: If True, saves results to a JSON file
        """
        resume_files = self.get_resume_files()
        
        if not resume_files:
            logger.warning("No resume files found to test!")
            return
        
        results = []
        
        print(f"\n{'#'*80}")
        print(f"# RESUME EXTRACTION TEST")
        print(f"# Testing {len(resume_files)} resume files")
        print(f"# Directory: {self.resumes_dir}")
        print(f"{'#'*80}\n")
        
        for file_path in resume_files:
            result = await self.extract_from_file(file_path)
            results.append(result)
            self.print_result(result)
        
        # Summary
        successful = sum(1 for r in results if r['status'] == 'success')
        failed = len(results) - successful
        
        print(f"\n{'='*80}")
        print(f"SUMMARY")
        print(f"{'='*80}")
        print(f"Total files tested:    {len(results)}")
        print(f"✅ Successful:         {successful}")
        print(f"❌ Failed:             {failed}")
        
        # Identify common issues
        print(f"\n🔍 EXTRACTION ACCURACY CHECK")
        print(f"{'─'*80}")
        
        name_extraction_count = sum(1 for r in results 
                                   if r['status'] == 'success' 
                                   and r['personal_info']['full_name'])
        email_extraction_count = sum(1 for r in results 
                                    if r['status'] == 'success' 
                                    and r['personal_info']['email'])
        skills_extraction_count = sum(1 for r in results 
                                     if r['status'] == 'success' 
                                     and r['skills']['technical_skills'])
        
        if successful > 0:
            print(f"Names extracted:       {name_extraction_count}/{successful} ({name_extraction_count/successful*100:.1f}%)")
            print(f"Emails extracted:      {email_extraction_count}/{successful} ({email_extraction_count/successful*100:.1f}%)")
            print(f"Skills extracted:      {skills_extraction_count}/{successful} ({skills_extraction_count/successful*100:.1f}%)")
        else:
            print(f"Names extracted:       {name_extraction_count}/{successful} (N/A)")
            print(f"Emails extracted:      {email_extraction_count}/{successful} (N/A)")
            print(f"Skills extracted:      {skills_extraction_count}/{successful} (N/A)")
        
        # Save results to file
        if save_to_file:
            output_file = Path(__file__).parent / "resume_extraction_test_results.json"
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(results, f, indent=2, ensure_ascii=False)
            print(f"\n💾 Detailed results saved to: {output_file}")
        
        return results


async def main():
    """Main function to run the resume extraction tests."""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Test resume extraction on PDF files',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Test all resumes in default directory
  python test_resume_extraction.py
  
  # Test specific resume file
  python test_resume_extraction.py --file "MAGALONA_RESUME.pdf"
  
  # Use custom resumes directory
  python test_resume_extraction.py --dir "/path/to/resumes"
        """
    )
    
    parser.add_argument(
        '--dir',
        type=str,
        help='Directory containing resume files (defaults to project resumes folder)'
    )
    
    parser.add_argument(
        '--file',
        type=str,
        help='Test a specific resume file by name (must be in resumes directory)'
    )
    
    parser.add_argument(
        '--no-save',
        action='store_true',
        help='Do not save results to JSON file'
    )
    
    args = parser.parse_args()
    
    try:
        tester = ResumeExtractionTester(resumes_dir=args.dir)
        
        if args.file:
            # Test single file
            file_path = tester.resumes_dir / args.file
            if not file_path.exists():
                print(f"❌ File not found: {file_path}")
                return
            
            print(f"\nTesting single file: {args.file}\n")
            result = await tester.extract_from_file(file_path)
            tester.print_result(result)
            
            if not args.no_save:
                output_file = Path(__file__).parent / f"resume_extraction_test_{args.file}.json"
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(result, f, indent=2, ensure_ascii=False)
                print(f"\n💾 Results saved to: {output_file}")
        else:
            # Test all files
            await tester.test_all_resumes(save_to_file=not args.no_save)
            
    except Exception as e:
        logger.error(f"Fatal error: {str(e)}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
