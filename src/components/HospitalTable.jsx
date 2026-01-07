import { DetailsList, Text, Stack, IconButton, mergeStyles, Icon } from "@fluentui/react";

const cellStyles = mergeStyles({
    fontSize: '13px',
    color: '#323130',
});

export default function HospitalTable({ hospitals, onEditHospital, onViewDicom }) {

    const columns = [
        {
            key: "name",
            name: "Hospital Name",
            fieldName: "name",
            minWidth: 220,
            maxWidth: 300,
            isResizable: true,
            onRender: (item) => (
                <Stack verticalAlign="center" styles={{ root: { height: '100%' } }}>
                    <Text className={cellStyles} styles={{ root: { fontWeight: 600 } }}>
                        {item.name}
                    </Text>
                    <Text variant="small" styles={{ root: { color: '#605e5c' } }}>
                        ID: {item.id}
                    </Text>
                </Stack>
            ),
        },
        {
            key: "hospitalCode",
            name: "Hospital Code",
            fieldName: "hospitalCode",
            minWidth: 180,
            maxWidth: 250,
            isResizable: true,
            onRender: (item) => (
                <Text className={cellStyles}>
                    {item.hospitalCode}
                </Text>
            ),
        },
        {
            key: "address",
            name: "Address",
            fieldName: "address",
            minWidth: 250,
            maxWidth: 350,
            isResizable: true,
            onRender: (item) => (
                <Text className={cellStyles} styles={{ root: { lineHeight: '20px' } }}>
                    {item.address}
                </Text>
            ),
        },
        {
            key: "date",
            name: "Registration Date",
            minWidth: 140,
            maxWidth: 160,
            onRender: (item) => (
                <Stack>
                    <Text className={cellStyles} styles={{ root: { fontWeight: 600 } }}>
                        {new Date(item.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        })}
                    </Text>
                    <Text variant="small" styles={{ root: { color: '#605e5c' } }}>
                        {new Date(item.date).toLocaleDateString('en-US', {
                            weekday: 'short'
                        })}
                    </Text>
                </Stack>
            ),
        },
        {
            key: "primaryContact",
            name: "Primary Contact",
            minWidth: 200,
            maxWidth: 250,
            onRender: (item) => {
                const primaryContact = item.contacts?.find(c => c.contactType === 0);

                return (
                    <Stack tokens={{ childrenGap: 4 }}>
                        {primaryContact ? (
                            <>
                                <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 6 }}>
                                    <Icon iconName="Contact" styles={{ root: { fontSize: 12, color: '#0078d4' } }} />
                                    <Text className={cellStyles} styles={{ root: { fontWeight: 600 } }}>
                                        {primaryContact.name}
                                    </Text>
                                </Stack>
                                <Stack styles={{ root: { paddingLeft: 18 } }}>
                                    <Text variant="small" styles={{ root: { color: '#605e5c' } }}>
                                        📞 {primaryContact.phone}
                                    </Text>
                                    <Text variant="small" styles={{ root: { color: '#605e5c' } }}>
                                        ✉️ {primaryContact.email}
                                    </Text>
                                </Stack>
                            </>
                        ) : (
                            <Text variant="small" styles={{ root: { color: '#a19f9d', fontStyle: 'italic' } }}>
                                No primary contact
                            </Text>
                        )}
                    </Stack>
                );
            },
        },
        {
            key: "secondaryContact",
            name: "Secondary Contact",
            minWidth: 200,
            maxWidth: 250,
            onRender: (item) => {
                const secondaryContact = item.contacts?.find(c => c.contactType === 1);

                return (
                    <Stack tokens={{ childrenGap: 4 }}>
                        {secondaryContact ? (
                            <>
                                <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 6 }}>
                                    <Icon iconName="Contact" styles={{ root: { fontSize: 12, color: '#8a8886' } }} />
                                    <Text className={cellStyles} styles={{ root: { fontWeight: 600 } }}>
                                        {secondaryContact.name}
                                    </Text>
                                </Stack>
                                <Stack styles={{ root: { paddingLeft: 18 } }}>
                                    <Text variant="small" styles={{ root: { color: '#605e5c' } }}>
                                        📞 {secondaryContact.phone}
                                    </Text>
                                    <Text variant="small" styles={{ root: { color: '#605e5c' } }}>
                                        ✉️ {secondaryContact.email}
                                    </Text>
                                </Stack>
                            </>
                        ) : (
                            <Text variant="small" styles={{ root: { color: '#a19f9d', fontStyle: 'italic' } }}>
                                No secondary contact
                            </Text>
                        )}
                    </Stack>
                );
            },
        },
        // In HospitalTable.jsx - Update the actions column:
        {
            key: "actions",
            name: "Actions",
            minWidth: 150,
            maxWidth: 180,
            onRender: (item) => (
                <Stack horizontal tokens={{ childrenGap: 8 }}>
                    {/* DICOM File Icon */}
                    <IconButton
                        iconProps={{ iconName: 'Documentation' }}
                        title="View/Upload DICOM"
                        ariaLabel="View/Upload DICOM"
                        styles={{
                            root: {
                                height: 32,
                                width: 32,
                                color: '#107c10',
                                backgroundColor: 'transparent',
                                ':hover': {
                                    backgroundColor: '#107c10',
                                    color: 'white'
                                }
                            },
                            icon: {
                                fontSize: 14,
                            }
                        }}
                        onClick={() => onViewDicom && onViewDicom(item)}
                    />

                    {/* Edit Hospital Button */}
                    <IconButton
                        iconProps={{ iconName: 'Edit' }}
                        title="Edit Hospital"
                        ariaLabel="Edit Hospital"
                        styles={{
                            root: {
                                height: 32,
                                width: 32,
                                color: '#0078d4',
                                backgroundColor: 'transparent',
                                ':hover': {
                                    backgroundColor: '#0078d4',
                                    color: 'white'
                                }
                            },
                            icon: {
                                fontSize: 14,
                            }
                        }}
                        onClick={() => onEditHospital && onEditHospital(item)}
                    />
                </Stack>
            ),
        },
    ];

    return (
        <Stack tokens={{ childrenGap: 8 }}>
            <Text variant="mediumPlus" styles={{
                root: {
                    marginBottom: 16,
                    fontWeight: 600,
                    color: '#323130',
                    paddingBottom: 8,
                    borderBottom: '2px solid #e1dfdd'
                }
            }}>
                <Icon iconName="Hospital" styles={{ root: { marginRight: 8, fontSize: 18, color: '#0078d4' } }} />
                Registered Hospitals ({hospitals.length})
            </Text>

            <DetailsList
                items={hospitals}
                columns={columns}
                styles={{
                    root: {
                        border: "1px solid #e1dfdd",
                        borderRadius: 4,
                        overflow: 'hidden',
                    },
                    headerWrapper: {
                        backgroundColor: '#faf9f8',
                        borderBottom: '2px solid #e1dfdd',
                    },
                    contentWrapper: {
                        backgroundColor: '#ffffff',
                    }
                }}
            />
        </Stack>
    );
}