import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  WriteBatch,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase.local';
import { Commune, CreateCommuneData } from '../models/Commune';

const COLLECTION_NAME = 'communes';

export class CommuneService {
  /**
   * Tạo một commune mới
   */
  static async create(data: CreateCommuneData): Promise<string> {
    try {
      const communeRef = doc(collection(db, COLLECTION_NAME));
      const communeData = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(communeRef, communeData);
      return communeRef.id;
    } catch (error) {
      console.error('Error creating commune:', error);
      throw error;
    }
  }

  /**
   * Lấy commune theo ID
   */
  static async getById(id: string): Promise<Commune | null> {
    try {
      const communeRef = doc(db, COLLECTION_NAME, id);
      const communeSnap = await getDoc(communeRef);
      
      if (communeSnap.exists()) {
        return {
          id: communeSnap.id,
          ...communeSnap.data()
        } as Commune;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting commune:', error);
      throw error;
    }
  }

  /**
   * Lấy commune theo mã xã
   */
  static async getByMaXa(ma_xa: string): Promise<Commune | null> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('ma_xa', '==', ma_xa)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data()
        } as Commune;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting commune by ma_xa:', error);
      throw error;
    }
  }

  /**
   * Lấy tất cả communes
   */
  static async getAll(): Promise<Commune[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Commune));
    } catch (error) {
      console.error('Error getting all communes:', error);
      throw error;
    }
  }

  /**
   * Cập nhật commune
   */
  static async update(id: string, data: Partial<CreateCommuneData>): Promise<void> {
    try {
      const communeRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(communeRef, {
        ...data,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating commune:', error);
      throw error;
    }
  }

  /**
   * Xóa commune
   */
  static async delete(id: string): Promise<void> {
    try {
      const communeRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(communeRef);
    } catch (error) {
      console.error('Error deleting commune:', error);
      throw error;
    }
  }

  /**
   * Import nhiều communes cùng lúc (batch write)
   */
  static async batchCreate(communes: CreateCommuneData[]): Promise<void> {
    try {
      const batchSize = 500; // Firestore giới hạn 500 operations per batch
      
      for (let i = 0; i < communes.length; i += batchSize) {
        const batch = writeBatch(db);
        const batchCommunes = communes.slice(i, i + batchSize);
        
        batchCommunes.forEach((commune) => {
          const communeRef = doc(collection(db, COLLECTION_NAME));
          batch.set(communeRef, {
            ...commune,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        });
        
        await batch.commit();
        console.log(`Batch ${Math.floor(i / batchSize) + 1} imported successfully`);
      }
    } catch (error) {
      console.error('Error batch creating communes:', error);
      throw error;
    }
  }

  /**
   * Xóa tất cả communes (cẩn thận!)
   */
  static async deleteAll(): Promise<void> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      const batchSize = 500;
      
      for (let i = 0; i < querySnapshot.docs.length; i += batchSize) {
        const batch = writeBatch(db);
        const batchDocs = querySnapshot.docs.slice(i, i + batchSize);
        
        batchDocs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        
        await batch.commit();
      }
      
      console.log('All communes deleted successfully');
    } catch (error) {
      console.error('Error deleting all communes:', error);
      throw error;
    }
  }
}
