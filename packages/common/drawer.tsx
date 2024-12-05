// import {
//     Modal,
//     ModalBody, // ModalFooter,
//     ModalContent,
//     ModalHeader,
// } from '@nextui-org/react';
// import React, { useEffect, useState } from 'react';

// type PlacementType =
//     | 'bottom'
//     | 'top'
//     | 'center'
//     | 'auto'
//     | 'top-center'
//     | 'bottom-center'
//     | undefined;

// // Drawer
// function Drawer({
//     show = false,
//     title,
//     children,
//     placement = 'bottom-center',
//     onClose,
// }: {
//     show: boolean;
//     title: string;
//     children: any;
//     placement?: PlacementType;
//     onClose: () => void;
// }) {
//     const [showDrawer, setShowDrawer] = useState(show);
//     useEffect(() => {
//         setShowDrawer(show);
//     }, [show]);

//     console.log('children', children, placement);
//     return (
//         <>
//             <Modal
//                 isOpen={showDrawer}
//                 placement={placement}
//                 onClose={onClose}
//                 className="ez-sm:mx-2 ez-sm:my-2 ez-max-w-md"
//                 classNames={{
//                     wrapper:
//                         'ez-max-w-md ez-mx-auto ez-absolute ez-w-full ez-h-max ez-top-[calc(100%-200px)] ez-left-0',
//                     backdrop: '',
//                 }}
//                 portalContainer={document.querySelector('.easydapp-card-body')!}
//             >
//                 <ModalContent>
//                     {() => (
//                         <>
//                             <ModalHeader className="ez-flex ez-flex-col ez-gap-1">
//                                 {title}
//                             </ModalHeader>
//                             <ModalBody>{children}</ModalBody>
//                             {/* <ModalFooter></ModalFooter> */}
//                         </>
//                     )}
//                 </ModalContent>
//             </Modal>
//         </>
//     );
// }

// export default Drawer;
