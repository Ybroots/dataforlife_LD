import { ContactService } from './ContactService';
import { CommuneService } from './CommuneService';
import { ContactWithCommune } from '../models/ContactWithCommune';
import { Contact } from '../models/Contact';

/**
 * Service để lấy contacts kèm thông tin commune
 */
export class ContactCombinedService {
  /**
   * Lấy tất cả contacts kèm thông tin commune
   */
  static async getAllContactsWithCommunes(): Promise<ContactWithCommune[]> {
    try {
      // Lấy tất cả contacts và communes
      const [contacts, communes] = await Promise.all([
        ContactService.getAll(),
        CommuneService.getAll()
      ]);

      // Tạo map để tra cứu nhanh commune theo ma_xa
      const communeMap = new Map(
        communes.map(commune => [commune.ma_xa, commune])
      );

      // Kết hợp contact với commune
      const contactsWithCommunes: ContactWithCommune[] = contacts.map(contact => ({
        id: contact.id,
        ma_xa: contact.ma_xa,
        ten_xa: contact.ten_xa,  // Lưu ten_xa từ Contact
        fullName: contact.chief,
        mobile: contact.mobile,
        communeInfo: communeMap.get(contact.ma_xa) || null,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt
      }));

      return contactsWithCommunes;
    } catch (error) {
      console.error('Error getting contacts with communes:', error);
      throw error;
    }
  }

  /**
   * Lấy contact theo ID kèm thông tin commune
   */
  static async getContactWithCommuneById(id: string): Promise<ContactWithCommune | null> {
    try {
      const contact = await ContactService.getById(id);
      
      if (!contact) {
        return null;
      }

      const commune = await CommuneService.getByMaXa(contact.ma_xa);

      return {
        id: contact.id,
        ma_xa: contact.ma_xa,
        ten_xa: contact.ten_xa,  // Lưu ten_xa từ Contact
        fullName: contact.chief,
        mobile: contact.mobile,
        communeInfo: commune,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt
      };
    } catch (error) {
      console.error('Error getting contact with commune:', error);
      throw error;
    }
  }

  /**
   * Lấy contact theo mã xã kèm thông tin commune
   */
  static async getContactWithCommuneByMaXa(ma_xa: string): Promise<ContactWithCommune | null> {
    try {
      const [contact, commune] = await Promise.all([
        ContactService.getByMaXa(ma_xa),
        CommuneService.getByMaXa(ma_xa)
      ]);

      if (!contact) {
        return null;
      }

      return {
        id: contact.id,
        ma_xa: contact.ma_xa,
        ten_xa: contact.ten_xa,  // Lưu ten_xa từ Contact
        fullName: contact.chief,
        mobile: contact.mobile,
        communeInfo: commune,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt
      };
    } catch (error) {
      console.error('Error getting contact with commune by ma_xa:', error);
      throw error;
    }
  }
}

// Export các hàm tiện ích
export const getAllContactsWithCommunes = ContactCombinedService.getAllContactsWithCommunes;
export const getContactWithCommuneById = ContactCombinedService.getContactWithCommuneById;
export const getContactWithCommuneByMaXa = ContactCombinedService.getContactWithCommuneByMaXa;

// Re-export deleteContact từ ContactService
export const deleteContact = ContactService.delete;
