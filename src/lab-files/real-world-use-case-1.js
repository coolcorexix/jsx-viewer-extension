import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
  } from 'react';
  import { bool, string, func, number } from 'prop-types';
  
  import {
    EllipsisWrapper,
    DropdownItem,
    DropdownMenu,
    DropdownDivider,
    StyledUrl,
  } from '../LibraryCard.styles';
  
  import {
    Dropdown,
    Typography,
    notification,
    Spin,
  } from '../../../../../components';
  import { EllipsisHIcon } from '../../../../../raw-icons';
  
  import ContentManageContext from '../../../ContentManage.context';
  import LibraryContext from '../../../pages/Library/Library.context';
  import {
    BULK_ACTION_TYPE,
    ELLIPSIS_ACTION_TYPE,
  } from '../../../pages/Library/Library.constants';
  import { cardDropdownProps } from '../LibraryCard.constants';
  import { CARD_MODEL_NAME } from './CardDropdown.constants';
  
  import ConfirmModal from '../../../pages/Library/components/ConfirmModal';
  import {
    OneFolderModalContent,
    OneCardModalContent,
  } from '../../../pages/Library/components/ModalContent';
  import MoveModal from '../../../pages/Library/components/MoveModal';
  import RenameModal from '../../../pages/Library/components/RenameModal';
  import CategorySelect from '../../../pages/Library/components/CategorySelect';
  import BulkActionNotification from '../../../pages/Library/components/BulkActionNotification';
  
  import PinModal from '../../../../ActionableUnitModal/PinModalV2/PinModal';
  import UpdatePermissionModal from '../../../../ActionableUnitModal/Content/UpdatePermissionModal/UpdatePermissionModal';
  
  import { CreateShortcutModal, DuplicateModal } from './CardDropdown.styles';
  import { DSCopyToPartnerModal } from '../../../pages/Library/modals/CopyToPartnerModal';
  import { LibraryShareViaBuyerSitesModal } from '../../../pages/Library/modals/LibraryShareViaBuyerSitesModal';
  import { useConfigureShareabilityModal } from '../../../../shared/ConfigureShareabilityModal';
  
  const DEFAULT_SELECTED_FOLDER = null;
  
  const INIT_NUMBER_OF_CHILDREN = {
    folders: 0,
    trainings: 0,
    assets: 0,
  };
  
  const DEFAULT_PROPS_DUPLICATE_MODAL = {
    folderId: null,
    folderName: null,
    status: null,
    visible: false,
  };
  
  const CardDropdown = ({
    id,
    modelName,
    cardType,
    type,
    title,
    sourceType,
    pinStatus,
    ellipsisCompleteCallback,
    currentFolderId,
    canManageContent,
    canUpdate,
    isBookmarked,
    isShortcut,
    isHaveLinkMaterials,
    isPrivateFolder,
    external,
    useAsCurrentFolder,
    itemData,
  }) => {
    const {
      t: tContent,
      state: { currentFolderInfo, currentUser },
    } = useContext(ContentManageContext);
    const {
      fetchers: { fetchBuyerSites },
      handlers: {
        onBulkMove: onEllipsisMove,
        onBulkArchive: onEllipsisArchive,
        onBulkDelete: onEllipsisDelete,
        onCopyToPartner,
        onShareViaBuyerSites,
        onCreateThenShareViaBuyerSites,
        onDownloadAsset,
        onFetchNumberOfChildren,
        onFetchItemOfShortcut,
        pinHandlers: pinHandlersUpdatePin,
        updatePermissionHandlers,
        onEllipsBookmark,
        onEllipsisRename,
        onEllipsisCreateShortcut,
        onFolderTitleClick,
        terminateContentSuccessCallback,
        createSiteUploadToS3ForBuyerSiteLogo,
      },
      subComponents: { singleTagModal: SingleTagModal },
      t,
      Trans,
    } = useContext(LibraryContext);
    const [selectedItems, setSelectedItems] = useState({
      folders: [],
      trainings: [],
      assets: [],
    });
    const { folders: selectedFoldersItem } = selectedItems;
    const [currentPinStatus, setCurrentPinStatus] = useState(pinStatus);
  
    const {
      openModal: openConfigureShareabilityModal,
    } = useConfigureShareabilityModal();
  
    const [modalVisible, setModalVisible] = useState(false);
    const [propsDuplicateModal, setPropsDuplicateModal] = useState(
      DEFAULT_PROPS_DUPLICATE_MODAL
    );
    const [bulkActionType, setBulkActionType] = useState(null);
    const [ellipsisActionType, setEllipsisActionType] = useState(null);
    const [loading, setLoading] = useState(true);
    const [numberOfChildren, setNumberOfChildren] = useState(
      INIT_NUMBER_OF_CHILDREN
    );
    const [itemOfShortcut, setItemOfShortcut] = useState([]);
    const [destinationFolder, setDestinationFolder] = useState(
      DEFAULT_SELECTED_FOLDER
    );
    const [dstFolderCreateShortcut, setDstFolderCreateShortcut] = useState(
      DEFAULT_SELECTED_FOLDER
    );
  
    const initItem = useCallback(() => {
      if (modelName === CARD_MODEL_NAME.LIBRARY_FOLDER) {
        setSelectedItems({
          ...selectedItems,
          folders: [{ id, title, modelName }],
        });
      } else if (
        modelName === CARD_MODEL_NAME.HUDDLE ||
        modelName === CARD_MODEL_NAME.ONBOARDING
      ) {
        setSelectedItems({
          ...selectedItems,
          trainings: [{ id, title, modelName }],
        });
      } else {
        setSelectedItems({
          ...selectedItems,
          assets: [
            {
              id,
              title,
              modelName,
              mimeType: itemData.mimeType,
              fileUrl: itemData.fileUrl,
            },
          ],
        });
      }
    }, [id, modelName, title]);
  
    const onFetchNumberOfChildrenSuccessCallback = useCallback(
      ({ folders, trainings, assets }) => {
        setLoading(false);
        setNumberOfChildren({ folders, trainings, assets });
      },
      []
    );
  
    const onFetchItemOfShortcutSuccessCallback = useCallback(({ shortcuts }) => {
      setLoading(false);
      setItemOfShortcut(shortcuts);
    }, []);
  
    const resetWhenFinish = useCallback(() => {
      setModalVisible(false);
      setLoading(true);
      setBulkActionType(null);
      setEllipsisActionType(null);
      setDestinationFolder(DEFAULT_SELECTED_FOLDER);
      setDstFolderCreateShortcut(DEFAULT_SELECTED_FOLDER);
      setNumberOfChildren(INIT_NUMBER_OF_CHILDREN);
      ellipsisCompleteCallback();
    }, []);
  
    const onEllipsisMoveSuccess = useCallback(() => {
      resetWhenFinish();
      notification.success({
        message: t('library.topbar.notification.move.message'),
        description: t('library.topbar.notification.move.description'),
      });
    }, [resetWhenFinish, t]);
  
    const onFolderTitleClickDuplicateHandler = useCallback(
      (e) => {
        window.history.pushState(
          {},
          null,
          `/content/folders/${propsDuplicateModal.folderId}`
        );
        onFolderTitleClick(propsDuplicateModal.folderId, e);
      },
      [propsDuplicateModal, onFolderTitleClick]
    );
  
    const onFolderClickSuccessHandler = useCallback(
      (folderId, e) => {
        onFolderTitleClick(folderId, e);
      },
      [onFolderTitleClick]
    );
  
    const duplicateModal = useMemo(() => {
      return (
        <DuplicateModal
          visible={propsDuplicateModal.visible}
          title={t('library.topbar.modal.createShortcut.duplicateShortcut')}
          okText={t('library.topbar.modal.createShortcut.goToFolder')}
          okDisabled={false}
          cancelText={t('library.errorModal.closeText')}
          onOkCallback={onFolderTitleClickDuplicateHandler}
          onCancelCallback={() => {
            setPropsDuplicateModal({ ...propsDuplicateModal, visible: false });
          }}
          colorIconModal='#7F8FA7'
          typeIconModal='faInfoCircle'
        >
          <Trans
            t={t}
            i18nKey='library.topbar.notification.createShortcut.duplicateInFolder'
            values={{ folderName: propsDuplicateModal.folderName }}
            // eslint-disable-next-line react/jsx-key
            components={[<b />]}
          />
        </DuplicateModal>
      );
    }, [propsDuplicateModal]);
  
    const onEllipsisCreateShortcutSuccess = useCallback(
      ({ folderId, folderName, status }) => {
        if (status === 200) {
          notification.success({
            message: t('library.topbar.notification.move.message'),
            description: (
              <Trans
                t={t}
                i18nKey='library.topbar.notification.createShortcut.success'
                values={{ folderName }}
                components={[
                  // eslint-disable-next-line react/jsx-key
                  <StyledUrl
                    href={`/content/folders/${folderId}`}
                    onClick={(e) => onFolderClickSuccessHandler(folderId, e)}
                  />,
                ]}
              />
            ),
          });
          resetWhenFinish();
          setModalVisible(false);
        } else if (status === 202) {
          setPropsDuplicateModal({ folderId, folderName, status, visible: true });
        }
      },
      [resetWhenFinish, t]
    );
  
    const onEllipsisArchiveSuccess = useCallback(
      (cardTitle) => {
        if (!cardTitle) {
          BulkActionNotification.archive({
            message: t('library.topbar.notification.archive.message'),
            description: t(
              'library.topbar.notification.archive.descriptionMultipleItems'
            ),
          });
        } else {
          BulkActionNotification.archive({
            message: t('library.topbar.notification.archive.message'),
            description: (
              <Trans
                t={t}
                i18nKey='library.topbar.notification.archive.descriptionSingleItems'
                values={{ title: cardTitle }}
                // eslint-disable-next-line react/jsx-key
                components={[<b />]}
              />
            ),
          });
        }
        resetWhenFinish();
        if (useAsCurrentFolder) terminateContentSuccessCallback();
      },
      [resetWhenFinish, t]
    );
  
    const onEllipsisDeleteSuccess = useCallback(
      (cardTitle) => {
        if (!cardTitle) {
          BulkActionNotification.delete({
            message: t('library.topbar.notification.delete.message'),
            description: t(
              'library.topbar.notification.delete.descriptionMultipleItems'
            ),
          });
        } else {
          BulkActionNotification.delete({
            message: t('library.topbar.notification.delete.message'),
            description: (
              <Trans
                t={t}
                i18nKey='library.topbar.notification.delete.descriptionSingleItems'
                values={{ title: cardTitle }}
                // eslint-disable-next-line react/jsx-key
                components={[<b />]}
              />
            ),
          });
        }
        resetWhenFinish();
        if (useAsCurrentFolder) terminateContentSuccessCallback();
      },
      [resetWhenFinish, t]
    );
  
    const ellipsisRenameHandler = useCallback(
      (renameInput) => {
        onEllipsisRename({ id, modelName, renameInput, cardType });
        setModalVisible(false);
        resetWhenFinish();
      },
      [onEllipsisRename, id, modelName, resetWhenFinish, cardType]
    );
  
    const ellipsisMoveHandler = useCallback(() => {
      onEllipsisMove(selectedItems, destinationFolder.id, onEllipsisMoveSuccess);
      setModalVisible(false);
    }, [selectedItems, onEllipsisMove, destinationFolder, onEllipsisMoveSuccess]);
  
    const ellipsisCreateShortcutHandler = useCallback(() => {
      onEllipsisCreateShortcut(
        selectedItems,
        dstFolderCreateShortcut.id,
        onEllipsisCreateShortcutSuccess
      );
    }, [
      selectedItems,
      onEllipsisCreateShortcut,
      dstFolderCreateShortcut,
      onEllipsisCreateShortcutSuccess,
    ]);
  
    const ellipsisArchiveHandler = useCallback(() => {
      onEllipsisArchive(selectedItems, onEllipsisArchiveSuccess);
      setModalVisible(false);
    }, [selectedItems, onEllipsisArchive, onEllipsisArchiveSuccess]);
  
    const bulkDeleteHandler = useCallback(() => {
      onEllipsisDelete(selectedItems, onEllipsisDeleteSuccess);
      setModalVisible(false);
    }, [selectedItems, onEllipsisDelete, onEllipsisDeleteSuccess]);
  
    const onSelectCategoryHandler = useCallback((toFolderId, toFolder) => {
      setDestinationFolder(toFolder);
    }, []);
  
    const onSelectCategoryCreateShortcutHandler = useCallback(
      (toFolderId, toFolder) => {
        setDstFolderCreateShortcut(toFolder);
      },
      []
    );
  
    const ellipsisUpdatePinHandler = (newStatus) => {
      setCurrentPinStatus(newStatus);
    };
  
    const modalContent = useCallback(() => {
      const actionTypeText = bulkActionType.toLowerCase();
      if (modelName === CARD_MODEL_NAME.LIBRARY_FOLDER) {
        return (
          <OneFolderModalContent
            folderName={title}
            actionTypeText={actionTypeText}
            numFolders={numberOfChildren.folders}
            numTrainings={numberOfChildren.trainings}
            numAssets={numberOfChildren.assets}
            t={t}
            Trans={Trans}
          />
        );
      }
  
      if (
        modelName === CARD_MODEL_NAME.HUDDLE ||
        modelName === CARD_MODEL_NAME.ONBOARDING
      ) {
        return (
          <OneCardModalContent
            cardName={title}
            actionTypeText={actionTypeText}
            t={t}
            Trans={Trans}
          />
        );
      }
  
      return (
        <OneCardModalContent
          cardName={title}
          actionTypeText={actionTypeText}
          t={t}
          Trans={Trans}
          isShortcut={isShortcut}
          isHaveLinkMaterials={isHaveLinkMaterials}
          itemOfShortcut={itemOfShortcut}
        />
      );
    }, [
      bulkActionType,
      id,
      title,
      modelName,
      numberOfChildren,
      isShortcut,
      isHaveLinkMaterials,
      itemOfShortcut,
    ]);
  
    const bulkActionPropertiesHash = useMemo(
      () => ({
        MOVE: {
          title: t('library.topbar.modal.move.title'),
          okText: t('library.topbar.modal.move.okText'),
          onOkCallback: ellipsisMoveHandler,
          okButtonClassname: 'btn-danger',
          content: () => (
            <>
              <CategorySelect
                currentFolderId={currentFolderId}
                selectedFolders={selectedFoldersItem}
                onSelectCategory={onSelectCategoryHandler}
                folderTitle={destinationFolder ? destinationFolder.title : null}
                actionType={BULK_ACTION_TYPE.MOVE}
              />
            </>
          ),
        },
        CREATE_SHORTCUT: {
          title: t('library.topbar.modal.createShortcut.title'),
          okText: t('modal.folder.create'),
          onOkCallback: ellipsisCreateShortcutHandler,
          okButtonClassname: 'btn-danger',
          content: () => (
            <>
              <CategorySelect
                currentFolderId={currentFolderId}
                selectedFolders={selectedFoldersItem}
                onSelectCategory={onSelectCategoryCreateShortcutHandler}
                folderTitle={
                  dstFolderCreateShortcut ? dstFolderCreateShortcut.title : null
                }
                actionType={BULK_ACTION_TYPE.CREATE_SHORTCUT}
              />
            </>
          ),
        },
        ARCHIVE: {
          title: t('library.topbar.modal.archive.title'),
          okText: t('library.topbar.modal.archive.okText'),
          checkboxText: t('library.topbar.modal.archive.checkboxMessage'),
          onOkCallback: ellipsisArchiveHandler,
          okButtonClassname: 'btn-warning',
          content: modalContent,
        },
        DELETE: {
          title: t('library.topbar.modal.delete.title'),
          okText: t('library.topbar.modal.delete.okText'),
          checkboxText: t('library.topbar.modal.delete.checkboxMessage'),
          okButtonClassname: 'btn-danger',
          onOkCallback: bulkDeleteHandler,
          content: modalContent,
        },
  
        [BULK_ACTION_TYPE.COPY_TO_PARTNER]: {
          title: t('library.topbar.modal.copyToPartner.title'),
          okText: t('library.topbar.modal.copyToPartner.okText'),
          // not necessary for this modal
          onOkCallback: () => {},
          content: null,
        },
        [BULK_ACTION_TYPE.SHARE_VIA_BUYER_SITES]: {
          title: t('library.topbar.modal.copyToPartner.title'),
          okText: t('library.topbar.modal.copyToPartner.okText'),
          // not necessary for this modal
          onOkCallback: () => {},
          content: null,
        },
      }),
      [
        destinationFolder,
        dstFolderCreateShortcut,
        onSelectCategoryHandler,
        onSelectCategoryCreateShortcutHandler,
        ellipsisMoveHandler,
        ellipsisArchiveHandler,
        modalContent,
        bulkDeleteHandler,
        currentFolderId,
        selectedFoldersItem,
        t,
        itemOfShortcut,
        isShortcut,
      ]
    );
  
    const ellipsisActionPropertiesHash = useMemo(
      () => ({
        RENAME: {
          title: t('library.topbar.modal.rename.title'),
          onOkCallback: ellipsisRenameHandler,
        },
      }),
      [ellipsisRenameHandler, t]
    );
  
    // there should never be a bulk definition here
    const onCopyToPartnerEllipsis = useCallback(() => {
      // in this card dropdown file, there's always one item selected
      return async (modalFormValues) => {
        await onCopyToPartner({ ...selectedItems }, modalFormValues);
        setBulkActionType(null);
        setModalVisible(false);
        setLoading(true);
      };
    }, [selectedItems]);
    const onShareViaBuyerSitesEllipsis = useCallback(() => {
      return async (modalFormValues) => {
        await onShareViaBuyerSites({ ...selectedItems }, modalFormValues);
        setBulkActionType(null);
        setModalVisible(false);
        setLoading(true);
      };
    }, [selectedItems]);
  
    const onCreateThenShareViaBuyerSitesEllipsis = useCallback(() => {
      return async (modalFormValues) => {
        await onCreateThenShareViaBuyerSites(
          { ...selectedItems },
          modalFormValues
        );
      };
    }, [selectedItems]);
  
    const confirmBulkModalComponent = useMemo(() => {
      if (
        !bulkActionType ||
        [
          BULK_ACTION_TYPE.PIN,
          BULK_ACTION_TYPE.COPY_TO_PARTNER,
          BULK_ACTION_TYPE.UPDATE_PERMISSION,
        ].includes(bulkActionType)
      )
        return <></>;
  
      const bulkActionProperties = bulkActionPropertiesHash[bulkActionType];
      const { onOkCallback } = bulkActionProperties;
  
      return (
        <ConfirmModal
          visible={modalVisible}
          title={bulkActionProperties.title}
          okText={bulkActionProperties.okText}
          okButtonClassname={bulkActionProperties.okButtonClassname}
          cancelText={t('library.topbar.modal.cancel')}
          checkboxText={bulkActionProperties.checkboxText}
          onOkCallback={onOkCallback}
          onCancelCallback={() => {
            setBulkActionType(null);
            setModalVisible(false);
            setLoading(true);
          }}
          isDisplayCheckbox={
            bulkActionType !== BULK_ACTION_TYPE.DELETE ||
            (bulkActionType === BULK_ACTION_TYPE.DELETE &&
              (!isShortcut || isHaveLinkMaterials))
          }
        >
          {loading ? <Spin spinning /> : bulkActionProperties.content()}
        </ConfirmModal>
      );
    }, [loading, bulkActionType, modalVisible, bulkActionPropertiesHash, t]);
  
    const RenameModalComponent = useMemo(() => {
      if (ellipsisActionType !== ELLIPSIS_ACTION_TYPE.RENAME) return <></>;
  
      const ellipsisActionProperties =
        ellipsisActionPropertiesHash[ellipsisActionType];
      const { onOkCallback } = ellipsisActionProperties;
  
      return (
        <RenameModal
          visible={modalVisible}
          initialInput={title}
          onOkCallback={onOkCallback}
          onCancelCallback={() => {
            setEllipsisActionType(null);
            setModalVisible(false);
          }}
          t={t}
        />
      );
    }, [
      ellipsisActionType,
      ellipsisActionPropertiesHash,
      modalVisible,
      title,
      t,
    ]);
  
    const copyToPartnerModalComponent = useMemo(() => {
      if (bulkActionType !== BULK_ACTION_TYPE.COPY_TO_PARTNER) {
        return null;
      }
      return (
        <DSCopyToPartnerModal
          visible={modalVisible}
          onModalFormFinish={onCopyToPartnerEllipsis()}
          onCancel={() => {
            setBulkActionType(null);
            setModalVisible(false);
            setLoading(true);
          }}
        />
      );
    }, [bulkActionType]);
  
    const shareViaBsModalComponent = useMemo(() => {
      if (bulkActionType !== BULK_ACTION_TYPE.SHARE_VIA_BUYER_SITES) {
        return null;
      }
      return (
        <LibraryShareViaBuyerSitesModal
          createSiteUploadToS3ForBuyerSiteLogo={
            createSiteUploadToS3ForBuyerSiteLogo
          }
          fetchSitesToShare={fetchBuyerSites}
          onShareSite={onShareViaBuyerSitesEllipsis()}
          onCreateThenShareSite={onCreateThenShareViaBuyerSitesEllipsis()}
          visible={modalVisible}
          onCancel={() => {
            setBulkActionType(null);
            setModalVisible(false);
            setLoading(true);
          }}
        />
      );
    }, [bulkActionType, fetchBuyerSites]);
  
    const SingleTagModalComponent = useMemo(() => {
      if (ellipsisActionType !== ELLIPSIS_ACTION_TYPE.TAG) return <></>;
  
      return (
        <SingleTagModal
          visible={modalVisible}
          onModalVisibleHandler={setModalVisible}
          selectedItem={{ id, modelName, sectionType: cardType }}
        />
      );
    }, [ellipsisActionType, modalVisible, id, modelName]);
  
    const moveModalComponent = useMemo(() => {
      if (!bulkActionType || bulkActionType !== BULK_ACTION_TYPE.MOVE)
        return <></>;
  
      const bulkActionProperties = bulkActionPropertiesHash[bulkActionType];
      const { onOkCallback } = bulkActionProperties;
  
      return (
        <MoveModal
          visible={modalVisible}
          title={bulkActionProperties.title}
          okText={bulkActionProperties.okText}
          okDisabled={!destinationFolder}
          cancelText={t('library.topbar.modal.cancel')}
          onOkCallback={onOkCallback}
          onCancelCallback={() => {
            setBulkActionType(null);
            setModalVisible(false);
            setLoading(true);
          }}
        >
          {bulkActionProperties.content()}
        </MoveModal>
      );
    }, [
      destinationFolder,
      bulkActionType,
      modalVisible,
      bulkActionPropertiesHash,
      t,
    ]);
  
    const createShortcutModalComponent = useMemo(() => {
      if (!bulkActionType || bulkActionType !== BULK_ACTION_TYPE.CREATE_SHORTCUT)
        return <></>;
  
      const bulkActionProperties = bulkActionPropertiesHash[bulkActionType];
      const { onOkCallback } = bulkActionProperties;
  
      return (
        <CreateShortcutModal
          visible={modalVisible}
          title={bulkActionProperties.title}
          okText={bulkActionProperties.okText}
          okDisabled={!dstFolderCreateShortcut}
          cancelText={t('library.topbar.modal.cancel')}
          onOkCallback={onOkCallback}
          onCancelCallback={() => {
            setBulkActionType(null);
            setModalVisible(false);
            setLoading(true);
          }}
          colorIconModal='#7F8FA7'
          typeIconModal='faExternalLinkSquare'
        >
          {bulkActionProperties.content()}
        </CreateShortcutModal>
      );
    }, [
      dstFolderCreateShortcut,
      bulkActionType,
      modalVisible,
      bulkActionPropertiesHash,
      t,
    ]);
  
    const updatePinsModalComponent = useMemo(() => {
      return (
        <PinModal
          pinStatus={currentPinStatus}
          pinObject={{ className: modelName, id }}
          visible={modalVisible}
          {...pinHandlersUpdatePin}
          onSubmitSuccess={ellipsisUpdatePinHandler}
          onCloseModal={() => {
            setBulkActionType(null);
            setModalVisible(false);
            setLoading(true);
          }}
          t={pinHandlersUpdatePin.pinModalT}
        />
      );
    }, [modalVisible, tContent, id, modelName, currentPinStatus, bulkActionType]);
  
    const updatePermissionModal = useMemo(() => {
      return (
        <UpdatePermissionModal
          permissionStatus={isPrivateFolder}
          permissionObject={{ className: modelName, id, folderName: title }}
          visible={modalVisible}
          {...updatePermissionHandlers}
          onCloseModal={() => {
            setBulkActionType(null);
            setModalVisible(false);
          }}
          t={updatePermissionHandlers.updatePermissT}
          Trans={Trans}
        />
      );
    }, [
      isPrivateFolder,
      modelName,
      id,
      title,
      modalVisible,
      updatePermissionHandlers,
      Trans,
    ]);
  
    const dropdownContents = useMemo(() => {
      return (
        <DropdownMenu>
          {cardDropdownProps(
            {
              sourceType,
              cardType,
              assetType: type,
              externalFolder: currentFolderInfo.external,
              canManageContent,
              canUpdate,
              idCard: id,
              modelName,
              isBookmarked,
              canCopyToPartner: currentUser.abilities.canCopyToPartner,
              external,
              title,
              onDownloadAsset,
              onEllipsBookmark,
              setBulkActionType,
              setEllipsisActionType,
              setModalVisible,
              openConfigureShareabilityModal,
            },
            useAsCurrentFolder
          ).map((item, index) =>
            !item.isDisplay ? (
              <></>
            ) : item.className !== '' && item.isDisplay && item.isDivider ? (
              <>
                <DropdownItem
                  key={index}
                  icon={item.icon}
                  className={item.className}
                  disabled={item.isDisabled}
                  onClick={() => item.onClick()}
                >
                  <Typography.Title>{tContent(item.i18nKey)}</Typography.Title>
                </DropdownItem>
                <DropdownDivider />
              </>
            ) : item.className === '' && item.isDisplay && item.isDivider ? (
              <>
                <DropdownDivider />
              </>
            ) : (
              <>
                <DropdownItem
                  key={index}
                  icon={item.icon}
                  className={item.className}
                  disabled={item.isDisabled}
                  onClick={() => item.onClick()}
                >
                  <Typography.Title>{tContent(item.i18nKey)}</Typography.Title>
                </DropdownItem>
              </>
            )
          )}
        </DropdownMenu>
      );
    }, [
      sourceType,
      cardType,
      type,
      currentFolderInfo.external,
      canManageContent,
      canUpdate,
      id,
      modelName,
      isBookmarked,
      currentUser.abilities.canCopyToPartner,
      external,
      title,
      onDownloadAsset,
      onEllipsBookmark,
      openConfigureShareabilityModal,
      useAsCurrentFolder,
      tContent,
    ]);
  
    useEffect(() => {
      initItem();
    }, [id, modelName, title, initItem]);
  
    useEffect(() => {
      if (
        modalVisible &&
        (bulkActionType === BULK_ACTION_TYPE.ARCHIVE ||
          (bulkActionType === BULK_ACTION_TYPE.DELETE &&
            !isShortcut &&
            !isHaveLinkMaterials))
      ) {
        if (selectedItems.folders.length === 0) {
          onFetchNumberOfChildrenSuccessCallback({
            folders: 0,
            trainings: 0,
            assets: 0,
          });
          return;
        }
        onFetchNumberOfChildren(
          selectedItems,
          onFetchNumberOfChildrenSuccessCallback
        );
      }
    }, [
      modalVisible,
      onFetchNumberOfChildren,
      onFetchNumberOfChildrenSuccessCallback,
      selectedItems,
      bulkActionType,
    ]);
  
    useEffect(() => {
      if (
        modalVisible &&
        bulkActionType === BULK_ACTION_TYPE.DELETE &&
        modelName === CARD_MODEL_NAME.MATERIAL &&
        (isShortcut || isHaveLinkMaterials)
      ) {
        onFetchItemOfShortcut(id, onFetchItemOfShortcutSuccessCallback);
      }
    }, [
      modalVisible,
      bulkActionType,
      onFetchItemOfShortcut,
      onFetchItemOfShortcutSuccessCallback,
      modelName,
      isHaveLinkMaterials,
    ]);
  
    return (
      <>
        <Dropdown
          overlay={dropdownContents}
          action='click'
          placement='bottomRight'
        >
          <EllipsisWrapper
            className='ellipsis-icon'
            useAsCurrentFolder={useAsCurrentFolder}
          >
            <EllipsisHIcon />
          </EllipsisWrapper>
        </Dropdown>
        {modalVisible &&
          (bulkActionType === BULK_ACTION_TYPE.ARCHIVE ||
            bulkActionType === BULK_ACTION_TYPE.DELETE) &&
          confirmBulkModalComponent}
        {modalVisible &&
          bulkActionType === BULK_ACTION_TYPE.MOVE &&
          moveModalComponent}
        {modalVisible &&
          bulkActionType === BULK_ACTION_TYPE.CREATE_SHORTCUT &&
          createShortcutModalComponent}
        {propsDuplicateModal.visible &&
          bulkActionType === BULK_ACTION_TYPE.CREATE_SHORTCUT &&
          duplicateModal}
        {modalVisible &&
          bulkActionType === BULK_ACTION_TYPE.PIN &&
          updatePinsModalComponent}
        {modalVisible &&
          bulkActionType === BULK_ACTION_TYPE.COPY_TO_PARTNER &&
          copyToPartnerModalComponent}
        {modalVisible &&
          bulkActionType === BULK_ACTION_TYPE.UPDATE_PERMISSION &&
          updatePermissionModal}
        {modalVisible &&
          ellipsisActionType === ELLIPSIS_ACTION_TYPE.RENAME &&
          RenameModalComponent}
        {modalVisible &&
          ellipsisActionType === ELLIPSIS_ACTION_TYPE.TAG &&
          SingleTagModalComponent}
        {modalVisible &&
          bulkActionType === BULK_ACTION_TYPE.SHARE_VIA_BUYER_SITES &&
          shareViaBsModalComponent}
      </>
    );
  };
  
  export default CardDropdown;
  
  CardDropdown.propTypes = {
    id: number,
    currentFolderId: number,
    modelName: string,
    cardType: string,
    pinStatus: string,
    type: string,
    title: string,
    sourceType: string,
    canManageContent: bool,
    isBookmarked: bool,
    isShortcut: bool,
    isHaveLinkMaterials: bool,
    ellipsisCompleteCallback: func,
    useAsCurrentFolder: bool,
    isPrivateFolder: bool,
    external: bool,
  };
  
  CardDropdown.defaultProps = {
    id: 0,
    currentFolderId: 0,
    modelName: '',
    cardType: '',
    pinStatus: 'inactive',
    type: '',
    title: '',
    sourceType: '',
    external: false,
    canManageContent: false,
    isBookmarked: false,
    isShortcut: false,
    isHaveLinkMaterials: false,
    useAsCurrentFolder: false,
    ellipsisCompleteCallback: () => {},
    isPrivateFolder: false,
  };
  