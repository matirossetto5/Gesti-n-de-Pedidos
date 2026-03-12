import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Project, MaterialLeadTime } from '../types';
import { OperationType, handleFirestoreError } from '../utils/firestoreError';
import { compareNumericalStrings } from '../utils/sortUtils';

import { INITIAL_LEAD_TIMES } from '../constants';

export const useFirestoreData = (user: any) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [leadTimes, setLeadTimes] = useState<MaterialLeadTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    console.log("User object in useFirestore:", user);
    setLoading(true);
    setError(null);

    // Consulta sin filtrar por ownerId
    const projectsQuery = query(collection(db, 'projects'));
    const unsubscribeProjects = onSnapshot(projectsQuery, (snapshot) => {
      console.log("Projects snapshot size:", snapshot.size);
      const projectsData = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log("Project doc:", doc.id, data);
        return { id: doc.id, ...data } as Project;
      });
      setProjects(projectsData);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching projects:", err);
      handleFirestoreError(err, OperationType.LIST, 'projects', auth);
      setError(err.message);
      setLoading(false);
    });

    const leadTimesQuery = query(collection(db, 'leadTimes'));
    const unsubscribeLeadTimes = onSnapshot(leadTimesQuery, async (snapshot) => {
      console.log("LeadTimes snapshot size:", snapshot.size);
      if (snapshot.empty) {
        console.log("LeadTimes snapshot is empty");
        return;
      }
      const leadTimesData = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log("LeadTime doc:", doc.id, data);
        return { id: doc.id, ...data } as MaterialLeadTime;
      });
      
      // Deduplicate based on category and subCategory
      const uniqueLeadTimes = leadTimesData.filter((lt, index, self) =>
        index === self.findIndex((t) => (
          t.category === lt.category && t.subCategory === lt.subCategory
        ))
      );
      
      // Sort numerically by category and subCategory
      uniqueLeadTimes.sort((a, b) => {
        const catCompare = compareNumericalStrings(a.category, b.category);
        if (catCompare !== 0) return catCompare;
        
        // If categories are the same, sort by subCategory
        if (a.subCategory && b.subCategory) {
          return compareNumericalStrings(a.subCategory, b.subCategory);
        }
        return 0;
      });
      
      setLeadTimes(uniqueLeadTimes);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'leadTimes', auth);
    });

    return () => {
      unsubscribeProjects();
      unsubscribeLeadTimes();
    };
  }, [user]);

  const saveProject = async (project: Project) => {
    try {
      console.log("Saving project:", project);
      
      // Función recursiva para eliminar valores undefined
      const removeUndefined = (obj: any): any => {
        if (obj === undefined || obj === null) return null;
        if (typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) return obj.map(removeUndefined);
        
        const newObj: any = {};
        for (const key in obj) {
          if (obj[key] !== undefined) {
            newObj[key] = removeUndefined(obj[key]);
          }
        }
        return newObj;
      };

      const sanitizedProject = removeUndefined(project);
      console.log("Sanitized project:", sanitizedProject);
      await setDoc(doc(db, 'projects', project.id), sanitizedProject);
      console.log("Project saved successfully to Firestore");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `projects/${project.id}`, auth);
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      await deleteDoc(doc(db, 'projects', projectId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `projects/${projectId}`, auth);
    }
  };

  const updateLeadTime = async (leadTime: MaterialLeadTime) => {
    try {
      await setDoc(doc(db, 'leadTimes', leadTime.id), leadTime);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `leadTimes/${leadTime.id}`, auth);
    }
  };

  return { projects, leadTimes, loading, error, saveProject, deleteProject, updateLeadTime };
};
