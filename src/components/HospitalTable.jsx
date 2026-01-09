import {DetailsList, Text, Stack, IconButton, mergeStyles, Icon, DetailsHeader} from "@fluentui/react";

const cellStyles = mergeStyles({
    fontSize: '13px',
    color: '#323130',
});

export default function HospitalTable({ hospitals, onEditHospital, onViewDicom , onDeleteHospital}) {

    const columns = [
        {
            key: "name",
            name: "Hospital Name",
            fieldName: "name",
            minWidth: 220,
            maxWidth: 300,
            isResizable: true,
            onRender: (item) => (
                <Stack styles={{ root: { height: '100%' } }}>
                    <Text className={cellStyles} styles={{ root: { fontWeight: 600 } }}>
                        {item.name}
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
                <div title={item.address} style={{ cursor: 'help' }}>
                    <Text className={cellStyles} styles={{
                        root: {
                            lineHeight: '20px',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxHeight: '60px', // 3 lines * 20px line height
                        }
                    }}>
                        {item.address}
                    </Text>
                </div>
            ),
        },
        {
            key: "date",
            name: "Registration Date",
            minWidth: 140,
            maxWidth: 160,
            onRender: (item) => {

                const formatDateTime = (value) => {
                    if (!value) return "--";

                    const date = new Date(value);

                    if (isNaN(date.getTime())) return "--";

                    const day = String(date.getDate()).padStart(2, '0');
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    const month = monthNames[date.getMonth()];
                    const year = String(date.getFullYear()).slice(-2);

                    let hours = date.getHours();
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    const ampm = hours >= 12 ? 'PM' : 'AM';
                    hours = hours % 12 || 12;

                    return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
                };

                return (
                    <Text className={cellStyles} styles={{ root: { fontWeight: 600 } }}>
                        {formatDateTime(item.date)}
                    </Text>
                );
            },

        },
        {
            key: "primaryContact",
            name: "Primary Contact",
            minWidth: 200,
            maxWidth: 250,
            onRender: (item) => {
                const primaryContact = item.contacts?.find(c => c.contactType === 0);

                return (
                    <Stack tokens={{ childrenGap: 2 }}> {/* Reduced gap */}
                        {primaryContact ? (
                            <>
                                {/* Name and icon in one line */}
                                <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 6 }}>
                                    <Icon
                                        iconName="Contact"
                                        styles={{
                                            root: {
                                                fontSize: 12,
                                                color: '#0078d4',
                                                marginTop: 2 // Added to align with text
                                            }
                                        }}
                                    />
                                    <Text
                                        className={cellStyles}
                                        styles={{
                                            root: {
                                                fontWeight: 600,
                                                lineHeight: '16px' // Added line height
                                            }
                                        }}
                                    >
                                        {primaryContact.name}
                                    </Text>
                                </Stack>

                                {/* Phone and email below - NO extra padding left */}
                                <Stack tokens={{ childrenGap: 2 }}>
                                    <Text variant="small" styles={{ root: { color: '#605e5c', lineHeight: '16px' } }}>
                                        📞 {primaryContact.phone}
                                    </Text>
                                    <Text variant="small" styles={{ root: { color: '#605e5c', lineHeight: '16px' } }}>
                                        ✉️ {primaryContact.email}
                                    </Text>
                                </Stack>
                            </>
                        ) : (
                            <Text variant="small" styles={{ root: { color: '#a19f9d', fontStyle: 'italic', lineHeight: '40px' } }}>
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
                    <Stack tokens={{ childrenGap: 2 }}>
                        {secondaryContact ? (
                            <>
                                <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 6 }}>
                                    <Icon
                                        iconName="Contact"
                                        styles={{
                                            root: {
                                                fontSize: 12,
                                                color: '#8a8886',
                                                marginTop: 2
                                            }
                                        }}
                                    />
                                    <Text
                                        className={cellStyles}
                                        styles={{
                                            root: {
                                                fontWeight: 600,
                                                lineHeight: '16px'
                                            }
                                        }}
                                    >
                                        {secondaryContact.name}
                                    </Text>
                                </Stack>
                                <Stack tokens={{ childrenGap: 2 }}>
                                    <Text variant="small" styles={{ root: { color: '#605e5c', lineHeight: '16px' } }}>
                                        📞 {secondaryContact.phone}
                                    </Text>
                                    <Text variant="small" styles={{ root: { color: '#605e5c', lineHeight: '16px' } }}>
                                        ✉️ {secondaryContact.email}
                                    </Text>
                                </Stack>
                            </>
                        ) : (
                            <Text variant="small" styles={{ root: { color: '#a19f9d', fontStyle: 'italic', lineHeight: '40px' } }}>
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
                        iconProps={{
                            iconName: 'FileImage',
                            styles: {
                                root: {
                                    color: item.hasDicomFile ? '#107c10' : '#0078d4',
                                    fontSize: 14,
                                }
                            }
                        }}
                        title={item.hasDicomFile ? 'View/Update DICOM' : 'Upload DICOM'}
                        ariaLabel={item.hasDicomFile ? 'View or update DICOM file' : 'Upload DICOM file'}
                        styles={{
                            root: {
                                height: 32,
                                width: 32,
                                backgroundColor: 'transparent',
                                ':hover': {
                                    backgroundColor: item.hasDicomFile ? '#dff6dd' : '#e1f5fe',
                                    color: item.hasDicomFile ? '#0b6b0b' : '#005a9e',
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
                    <IconButton
                        iconProps={{ iconName: 'Delete' }}
                        title="Delete Hospital"
                        ariaLabel="Delete Hospital"
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
                        onClick={() => onDeleteHospital && onDeleteHospital(item)}
                    />


                </Stack>
            ),
        },
    ];

    return (
        <Stack tokens={{ childrenGap: 8 }} styles={{ root: { padding: 0, margin: 0, width: '100vw' } }}>

            {/* Registered Hospitals aligned to extreme right */}
            <Stack horizontal horizontalAlign="end" verticalAlign="center" styles={{
                root: {
                    width: '100%',
                    margin: 0,
                    padding: 0,
                }
            }}>
            </Stack>

            {/* Table */}
            <DetailsList
                items={hospitals}
                columns={columns}
                selectionMode={1}
                checkboxVisibility={2}
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
                onRenderDetailsHeader={(props, defaultRender) => {
                    if (!props) return null;

                    return defaultRender({
                        ...props,
                        styles: {
                            root: {
                                paddingTop: 0,
                                minHeight: 42,
                            },
                            cell: {
                                paddingTop: 0,
                            },
                            cellTitle: {
                                lineHeight: '42px',
                                fontWeight: 600,
                            },
                        },
                    });
                }}
            />
        </Stack>
    );

}