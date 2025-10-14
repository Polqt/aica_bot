import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import {
  UserEducation,
  UserEducationCreate,
  UserExperience,
  UserExperienceCreate,
  UserSkill,
  UserSkillCreate,
  UserProfile,
  ResumeSummary,
} from '@/types/user';
import { toast } from 'sonner';

export function useResumeBuilder() {
  const [education, setEducation] = useState<UserEducation[]>([]);
  const [experience, setExperience] = useState<UserExperience[]>([]);
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [summary, setSummary] = useState<ResumeSummary | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Load all resume data
  const loadResumeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [educationData, experienceData, skillsData, summaryData] =
        await Promise.all([
          apiClient.getEducation(),
          apiClient.getExperience(),
          apiClient.getSkills(),
          apiClient.getResumeSummary(),
        ]);

      setEducation(educationData);
      setExperience(experienceData);
      setSkills(skillsData);
      setSummary(summaryData);
      setProfile(summaryData.profile);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load resume data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load only skills (faster, for modals)
  const loadSkills = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const skillsData = await apiClient.getSkills();
      setSkills(skillsData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load skills';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Education operations
  const addEducation = useCallback(
    async (educationData: UserEducationCreate) => {
      setSaving(true);
      try {
        const newEducation = await apiClient.addEducation(educationData);
        setEducation(prev => [...prev, newEducation]);
        toast.success('Education added successfully');
        return newEducation;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to add education';
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const updateEducation = useCallback(
    async (id: string, educationData: Partial<UserEducationCreate>) => {
      setSaving(true);
      try {
        const updatedEducation = await apiClient.updateEducation(
          id,
          educationData,
        );
        setEducation(prev =>
          prev.map(edu => (edu.id === id ? updatedEducation : edu)),
        );
        toast.success('Education updated successfully');
        return updatedEducation;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update education';
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const deleteEducation = useCallback(async (id: string) => {
    setSaving(true);
    try {
      await apiClient.deleteEducation(id);
      setEducation(prev => prev.filter(edu => edu.id !== id));
      toast.success('Education deleted successfully');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete education';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  // Experience operations
  const addExperience = useCallback(
    async (experienceData: UserExperienceCreate) => {
      setSaving(true);
      try {
        const newExperience = await apiClient.addExperience(experienceData);
        setExperience(prev => [...prev, newExperience]);
        toast.success('Experience added successfully');
        return newExperience;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to add experience';
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const updateExperience = useCallback(
    async (id: string, experienceData: Partial<UserExperienceCreate>) => {
      setSaving(true);
      try {
        const updatedExperience = await apiClient.updateExperience(
          id,
          experienceData,
        );
        setExperience(prev =>
          prev.map(exp => (exp.id === id ? updatedExperience : exp)),
        );
        toast.success('Experience updated successfully');
        return updatedExperience;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update experience';
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const deleteExperience = useCallback(async (id: string) => {
    setSaving(true);
    try {
      await apiClient.deleteExperience(id);
      setExperience(prev => prev.filter(exp => exp.id !== id));
      toast.success('Experience deleted successfully');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete experience';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  // Skills operations
  const addSkill = useCallback(async (skillData: UserSkillCreate) => {
    setSaving(true);
    try {
      const newSkill = await apiClient.addSkill(skillData);
      setSkills(prev => [...prev, newSkill]);
      toast.success('Skill added successfully');
      return newSkill;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to add skill';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const updateSkill = useCallback(
    async (id: string, skillData: Partial<UserSkillCreate>) => {
      setSaving(true);
      try {
        const updatedSkill = await apiClient.updateSkill(id, skillData);
        setSkills(prev =>
          prev.map(skill => (skill.id === id ? updatedSkill : skill)),
        );
        toast.success('Skill updated successfully');
        return updatedSkill;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update skill';
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const deleteSkill = useCallback(async (id: string) => {
    setSaving(true);
    try {
      await apiClient.deleteSkill(id);
      setSkills(prev => prev.filter(skill => skill.id !== id));
      toast.success('Skill deleted successfully');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete skill';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  // Profile operations
  const updateProfile = useCallback(
    async (profileData: Partial<UserProfile>) => {
      setSaving(true);
      try {
        const updatedProfile = await apiClient.updateProfile(profileData);
        setProfile(updatedProfile);
        toast.success('Profile updated successfully');
        return updatedProfile;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update profile';
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  // Reset all data
  const resetResume = useCallback(async () => {
    setSaving(true);
    try {
      await apiClient.resetResume();
      setEducation([]);
      setExperience([]);
      setSkills([]);
      setSummary(null);
      toast.success('Resume data reset successfully');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to reset resume';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    // State
    education,
    experience,
    skills,
    profile,
    summary,
    loading,
    error,
    saving,

    // Actions
    loadResumeData,
    loadSkills,
    addEducation,
    updateEducation,
    deleteEducation,
    addExperience,
    updateExperience,
    deleteExperience,
    addSkill,
    updateSkill,
    deleteSkill,
    updateProfile,
    resetResume,
  };
}
