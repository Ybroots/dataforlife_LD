// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Linking, ImageBackground, ActivityIndicator, Alert } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getAllContactsWithCommunes, deleteContact } from '../services';
import type { ContactWithCommune } from '../models';

type RootStackParamList = {
    ContactsList: undefined;
    CommuneDetail: { communeInfo: any };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ContactsScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [contacts, setContacts] = useState<ContactWithCommune[]>([]);
    const [loading, setLoading] = useState(true);

    // Load contacts từ Firebase
    useEffect(() => {
        loadContacts();
    }, []);

    const loadContacts = async () => {
        try {
            setLoading(true);
            const data = await getAllContactsWithCommunes();
            setContacts(data);
        } catch (error) {
            console.error('Error loading contacts:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách liên hệ');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteContact = async (id: string, fullName: string) => {
        Alert.alert(
            'Xác nhận xóa',
            `Bạn có chắc muốn xóa "${fullName}"?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteContact(id);
                            loadContacts(); // Refresh danh sách
                            Alert.alert('Thành công', 'Đã xóa liên hệ');
                        } catch (error) {
                            Alert.alert('Lỗi', 'Không thể xóa liên hệ');
                        }
                    }
                }
            ]
        );
    };

    // Danh sách hiển thị: 1 item / ma_xa, sort EMERGENCY* lên đầu
    const filteredContacts = useMemo(() => {
        // Group toàn bộ contacts theo ma_xa
        const grouped = new Map<string, ContactWithCommune[]>();
        contacts.forEach((contact) => {
            const maXa = String(contact.ma_xa || '').trim() || 'unknown';
            if (!grouped.has(maXa)) grouped.set(maXa, []);
            grouped.get(maXa)!.push(contact);
        });

        const query = searchQuery.toLowerCase();

        // Từ mỗi nhóm ma_xa, chọn 1 contact đại diện để hiển thị
        const groupsAsContacts: ContactWithCommune[] = [];

        grouped.forEach((group, maXa) => {
            if (group.length === 0) return;

            // Kiểm tra group có match search không (theo tên, mã xã, tên xã, tên tỉnh)
            const matchesGroup = group.some((c) =>
                c.fullName.toLowerCase().includes(query) ||
                String(c.ma_xa || '').toLowerCase().includes(query) ||
                (c.ten_xa || c.communeInfo?.ten_xa || '').toLowerCase().includes(query) ||
                (c.communeInfo?.ten_tinh || '').toLowerCase().includes(query)
            );

            if (!matchesGroup && query.length > 0) return;

            // Chọn bản ghi đầu tiên làm đại diện
            groupsAsContacts.push(group[0]);
        });

        // Sort: EMERGENCY* lên đầu, sau đó theo tên xã
        return groupsAsContacts.sort((a, b) => {
            const aIsEmergency = String(a.ma_xa || '').toUpperCase().includes('EMERGENCY');
            const bIsEmergency = String(b.ma_xa || '').toUpperCase().includes('EMERGENCY');

            if (aIsEmergency && !bIsEmergency) return -1;
            if (!aIsEmergency && bIsEmergency) return 1;

            const aTenXa = a.ten_xa || a.communeInfo?.ten_xa || '';
            const bTenXa = b.ten_xa || b.communeInfo?.ten_xa || '';
            return aTenXa.localeCompare(bTenXa, 'vi');
        });
    }, [contacts, searchQuery]);

    // Group contacts theo ma_xa để hiển thị khi expand
    const contactsByMaXa = useMemo(() => {
        const grouped = new Map<string, ContactWithCommune[]>();
        contacts.forEach((contact) => {
            // Normalize ma_xa: convert sang string, trim và đảm bảo không null/undefined
            const maXa = String(contact.ma_xa || '').trim() || 'unknown';
            if (!grouped.has(maXa)) {
                grouped.set(maXa, []);
            }
            grouped.get(maXa)!.push(contact);
        });
        
        // // Debug: Log số lượng contacts theo từng ma_xa
        // if (__DEV__) {
        //     grouped.forEach((contacts, maXa) => {
        //         if (contacts.length > 0) {
        //             console.log(`ma_xa: ${maXa}, số lượng contacts: ${contacts.length}`);
        //         }
        //     });
        // }
        
        return grouped;
    }, [contacts]);

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Đang tải...</Text>
            </View>
        );
    }

    const renderItem = ({ item }: { item: ContactWithCommune }) => {
        const isExpanded = item.id === expandedId;
        // Lấy tất cả contacts có cùng ma_xa (normalize để đảm bảo khớp)
        const maXa = String(item.ma_xa || '').trim() || 'unknown';
        const sameMaXaContacts = contactsByMaXa.get(maXa) || [];
        // Lấy ten_xa: ưu tiên từ Contact.ten_xa, sau đó từ communeInfo.ten_xa
        const firstContactWithTenXa = sameMaXaContacts.find(c => c.ten_xa || c.communeInfo?.ten_xa) || sameMaXaContacts[0] || item;
        const tenXa = firstContactWithTenXa?.ten_xa || firstContactWithTenXa?.communeInfo?.ten_xa || item.ten_xa || item.communeInfo?.ten_xa || '';
        // Lấy ten_tinh: tìm từ tất cả contacts trong nhóm, ưu tiên contact có communeInfo đầy đủ
        const contactWithTenTinh = sameMaXaContacts.find(c => c.communeInfo?.ten_tinh) || item;
        const tenTinh = contactWithTenTinh?.communeInfo?.ten_tinh || item.communeInfo?.ten_tinh || '';
        // Lấy cap từ communeInfo để kiểm tra có hiển thị nút chi tiết không
        // Tìm contact có communeInfo với cap được định nghĩa
        const contactWithCap = sameMaXaContacts.find(c => c.communeInfo && c.communeInfo.cap !== undefined) || item;
        const capValue = contactWithCap?.communeInfo?.cap;
        // Convert cap sang number để so sánh (có thể là string hoặc number)
        const cap = capValue !== undefined ? Number(capValue) : undefined;
        // Kiểm tra có communeInfo không (nếu không có thì là phòng ban/số điện thoại chung, không hiển thị nút)
        const communeInfo = contactWithCap?.communeInfo || item.communeInfo;
        const hasCommuneInfo = !!communeInfo;

        const normalizePhone = (mobile: string) => mobile.replace(/\./g, '').replace(/\-/g, '').replace(/\s/g, '');

        const handleCall = (mobile: string | null | undefined) => {
            if (!mobile) return;
            const phoneNumber = normalizePhone(mobile);
            Linking.openURL(`tel:${phoneNumber}`);
        };

        const handleViewDetail = () => {
            // Lấy communeInfo từ contact có communeInfo đầy đủ trong nhóm
            const contactWithCommuneInfo = sameMaXaContacts.find(c => c.communeInfo) || item;
            const communeInfoToShow = contactWithCommuneInfo?.communeInfo || communeInfo;
            
            if (communeInfoToShow) {
                navigation.navigate('CommuneDetail', { communeInfo: communeInfoToShow });
            } else {
                Alert.alert('Thông báo', 'Không có thông tin chi tiết cho xã này');
            }
        };

        return (
            <TouchableOpacity
                style={styles.card}
                activeOpacity={1}
                onPress={() => setExpandedId(isExpanded ? null : item.id || null)}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.nameContainer}>
                        <AntDesign 
                            name={isExpanded ? "down" : "right"} 
                            size={16} 
                            color="#333" 
                            style={styles.icon} 
                        />
                        <View style={styles.textContainer}>
                            <Text style={styles.name}>{`${tenXa}`}</Text>
                            <Text style={styles.addressPreview} numberOfLines={1}>
                                {tenXa ? (tenTinh ? `${tenXa}, ${tenTinh}` : tenXa) : ''}
                            </Text>
                        </View>
                    </View>
                    {hasCommuneInfo && cap !== 1 && (
                        <View style={styles.rightActions}>
                            <TouchableOpacity onPress={handleViewDetail}>
                                <AntDesign name="right-circle" size={24} color="red" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
                
                {isExpanded && (
                    <View style={styles.infoContainer}>
                        {/* Hiển thị tất cả contacts có cùng ma_xa */}
                        {sameMaXaContacts.length > 0 && (
                            <>
                                {tenXa && (
                                    <Text style={styles.sectionTitle}>
                                        {tenXa} ({sameMaXaContacts.length})
                                    </Text>
                                )}
                                {sameMaXaContacts.map((contact, index) => (
                                    <View key={contact.id || index} style={styles.contactItem}>
                                        <View style={styles.chiefContainer}>
                                            <View style={styles.chiefInfo}>
                                                <View style={styles.nameRow}>
                                                    <Text style={styles.chiefName}>{contact.fullName || 'Chưa có tên'}</Text>
                                                </View>
                                                {contact.mobile ? (
                                                    <Text style={styles.phoneNumber}>{contact.mobile}</Text>
                                                ) : (
                                                    <Text style={styles.noPhoneText}>Chưa có số điện thoại</Text>
                                                )}
                                            </View>
                                            {contact.mobile && (
                                                <View style={styles.actionButtons}>
                                                    <TouchableOpacity 
                                                        onPress={() => handleCall(contact.mobile)}
                                                        style={styles.phoneIconButton}
                                                    >
                                                        <Feather name="phone" size={24} color="red" style={{ transform: [{ scaleX: -1 }] }} />
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                ))}
                            </>
                        )}
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <ImageBackground
            source={require('../../assets/images/bg.png')}
            style={styles.container}
            resizeMode="cover"
            imageStyle={{ opacity: 0.2 }}
        >
            <Text style={styles.header}>Danh bạ điện thoại</Text>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchBar}
                    placeholder="Nhập tên đơn vị, xã, phường"
                    value={searchQuery}
                    onChangeText={(text) => setSearchQuery(text)}
                />
                
                {searchQuery.length > 0 && (
                    <TouchableOpacity 
                        style={styles.clearButton}
                        onPress={() => setSearchQuery('')}
                    >
                        <AntDesign name="close-circle" size={18} color="#999" />
                    </TouchableOpacity>
                )}
            </View>
            <FlatList
                data={filteredContacts}
                keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                renderItem={renderItem}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Chưa có liên hệ nào</Text>
                    </View>
                }
            />
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
        padding: 10,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    searchContainer: {
        position: 'relative',
        marginBottom: 10,
    },
    searchBar: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 10,
        paddingRight: 40,
        height: 50
    },
    clearButton: {
        position: 'absolute',
        right: 12,
        top: 16,
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 10,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    textContainer: {
        flex: 1,
    },
    rightActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    phoneButton: {
        padding: 4,
    },
    icon: {
        marginRight: 8,
    },
    infoContainer: {
        marginTop: 12,
        paddingLeft: 24,
    },
    address: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
        lineHeight: 20,
    },
    chiefContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    chiefInfo: {
        flex: 1,
    },
    chiefName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    phoneNumber: {
        fontSize: 14,
        color: '#007AFF',
    },
    phoneIconButton: {
        padding: 8,
        marginLeft: 12,
    },
    name: {
        fontWeight: '600',
        fontSize: 16,
        color: '#333',
    },
    addressPreview: {
        color: '#999',
        fontSize: 13,
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 12,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#007AFF',
        marginBottom: 8,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 6,
    },
    infoLabel: {
        fontSize: 14,
        color: '#666',
        width: 110,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    deleteButton: {
        backgroundColor: '#ff3b30',
        padding: 10,
        borderRadius: 6,
        alignItems: 'center',
        marginTop: 12,
    },
    deleteButtonText: {
        color: 'white',
        fontWeight: '600',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
    contactItem: {
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    saveIconButton: {
        padding: 8,
        marginLeft: 4,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    contactLabel: {
        fontSize: 12,
        color: '#dc3545',
        backgroundColor: '#ffe0e0',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        fontWeight: '600',
    },
    noPhoneText: {
        fontSize: 13,
        color: '#999',
        fontStyle: 'italic',
    },
});

export default ContactsScreen;
