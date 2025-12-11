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
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase.local';
import { Contact, CreateContactData } from '../models/Contact';

const COLLECTION_NAME = 'contacts';

export class ContactService {
  /**
   * Tạo một contact mới
   */
  static async create(data: CreateContactData): Promise<string> {
    try {
      const contactRef = doc(collection(db, COLLECTION_NAME));
      const contactData = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(contactRef, contactData);
      return contactRef.id;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  }

  /**
   * Lấy contact theo ID
   */
  static async getById(id: string): Promise<Contact | null> {
    try {
      const contactRef = doc(db, COLLECTION_NAME, id);
      const contactSnap = await getDoc(contactRef);
      
      if (contactSnap.exists()) {
        return {
          id: contactSnap.id,
          ...contactSnap.data()
        } as Contact;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting contact:', error);
      throw error;
    }
  }

  /**
   * Lấy contact theo mã xã
   */
  static async getByMaXa(ma_xa: string): Promise<Contact | null> {
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
        } as Contact;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting contact by ma_xa:', error);
      throw error;
    }
  }

  /**
   * Lấy tất cả contacts
   */
  static async getAll(): Promise<Contact[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Contact));
    } catch (error) {
      console.error('Error getting all contacts:', error);
      throw error;
    }
  }

  /**
   * Cập nhật contact
   */
  static async update(id: string, data: Partial<CreateContactData>): Promise<void> {
    try {
      const contactRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(contactRef, {
        ...data,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  }

  /**
   * Xóa contact
   */
  static async delete(id: string): Promise<void> {
    try {
      const contactRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(contactRef);
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  }

  /**
   * Import nhiều contacts cùng lúc (batch write)
   */
  static async batchCreate(contacts: CreateContactData[]): Promise<void> {
    try {
      const batchSize = 500; // Firestore giới hạn 500 operations per batch
      
      for (let i = 0; i < contacts.length; i += batchSize) {
        const batch = writeBatch(db);
        const batchContacts = contacts.slice(i, i + batchSize);
        
        batchContacts.forEach((contact) => {
          const contactRef = doc(collection(db, COLLECTION_NAME));
          batch.set(contactRef, {
            ...contact,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        });
        
        await batch.commit();
        console.log(`Batch ${Math.floor(i / batchSize) + 1} imported successfully`);
      }
    } catch (error) {
      console.error('Error batch creating contacts:', error);
      throw error;
    }
  }

  /**
   * Xóa tất cả contacts (cẩn thận!)
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
      
      console.log('All contacts deleted successfully');
    } catch (error) {
      console.error('Error deleting all contacts:', error);
      throw error;
    }
  }
}
