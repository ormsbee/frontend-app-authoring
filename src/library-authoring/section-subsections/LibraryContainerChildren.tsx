import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  useCallback, useContext, useEffect, useState,
} from 'react';
import {
  ActionRow, Badge, Icon, Stack,
} from '@openedx/paragon';
import { Description } from '@openedx/paragon/icons';
import DraggableList, { SortableItem } from '../../generic/DraggableList';
import Loading from '../../generic/Loading';
import ErrorAlert from '../../generic/alert-error';
import { ContainerType, getBlockType } from '../../generic/key-utils';
import { useLibraryContext } from '../common/context/LibraryContext';
import {
  useContainerChildren,
  useUpdateContainer,
  useUpdateContainerChildren,
} from '../data/apiHooks';
import { messages, subsectionMessages, sectionMessages } from './messages';
import containerMessages from '../containers/messages';
import { Container } from '../data/api';
import { InplaceTextEditor } from '../../generic/inplace-text-editor';
import { ToastContext } from '../../generic/toast-context';
import TagCount from '../../generic/tag-count';
import { ContainerMenu } from '../components/ContainerCard';
import { useLibraryRoutes } from '../routes';
import { useSidebarContext } from '../common/context/SidebarContext';

interface LibraryContainerChildrenProps {
  containerKey: string;
  /** set to true if it is rendered as preview */
  readOnly?: boolean;
}

interface LibraryContainerMetadataWithUniqueId extends Container {
  originalId: string;
}

interface ContainerRowProps extends LibraryContainerChildrenProps {
  container: LibraryContainerMetadataWithUniqueId;
}

const ContainerRow = ({ container, readOnly }: ContainerRowProps) => {
  const intl = useIntl();
  const { showToast } = useContext(ToastContext);
  const updateMutation = useUpdateContainer(container.originalId);
  const { showOnlyPublished } = useLibraryContext();

  const handleSaveDisplayName = async (newDisplayName: string) => {
    try {
      await updateMutation.mutateAsync({
        displayName: newDisplayName,
      });
      showToast(intl.formatMessage(containerMessages.updateContainerSuccessMsg));
    } catch (err) {
      showToast(intl.formatMessage(containerMessages.updateContainerErrorMsg));
    }
  };

  return (
    <>
      <InplaceTextEditor
        onSave={handleSaveDisplayName}
        text={showOnlyPublished ? (container.publishedDisplayName ?? container.displayName) : container.displayName}
        textClassName="font-weight-bold small"
        readOnly={readOnly || showOnlyPublished}
      />
      <ActionRow.Spacer />
      <Stack
        direction="horizontal"
        gap={3}
        // Prevent parent card from being clicked.
        /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
        onClick={(e) => e.stopPropagation()}
      >
        {!showOnlyPublished && container.hasUnpublishedChanges && (
          <Badge
            className="px-2 py-1"
            variant="warning"
          >
            <Stack direction="horizontal" gap={1}>
              <Icon size="xs" src={Description} />
              <FormattedMessage {...messages.draftChipText} />
            </Stack>
          </Badge>
        )}
        <TagCount size="sm" count={container.tagsCount} />
        {!readOnly && (
          <ContainerMenu
            containerKey={container.originalId}
            displayName={container.displayName}
          />
        )}
      </Stack>
    </>
  );
};

/** Component to display container children subsections for section and units for subsection */
export const LibraryContainerChildren = ({ containerKey, readOnly }: LibraryContainerChildrenProps) => {
  const intl = useIntl();
  const [orderedChildren, setOrderedChildren] = useState<LibraryContainerMetadataWithUniqueId[]>([]);
  const { showOnlyPublished, readOnly: libReadOnly } = useLibraryContext();
  const { navigateTo } = useLibraryRoutes();
  const { sidebarItemInfo } = useSidebarContext();
  const [activeDraggingId, setActiveDraggingId] = useState<string | null>(null);
  const orderMutator = useUpdateContainerChildren(containerKey);
  const { showToast } = useContext(ToastContext);
  const containerType = getBlockType(containerKey);
  const handleReorder = useCallback(() => async (newOrder?: LibraryContainerMetadataWithUniqueId[]) => {
    if (!newOrder) {
      return;
    }
    const childrenKeys = newOrder.map((o) => o.originalId);
    try {
      await orderMutator.mutateAsync(childrenKeys);
      showToast(intl.formatMessage(messages.orderUpdatedMsg));
    } catch (e) {
      showToast(intl.formatMessage(messages.failedOrderUpdatedMsg));
    }
  }, [orderMutator]);

  const {
    data: children,
    isLoading,
    isError,
    error,
  } = useContainerChildren(containerKey, showOnlyPublished);

  useEffect(() => {
    // Create new ids which are unique using index.
    // This is required to support multiple components with same id under a container.
    const newChildren = children?.map((child, idx) => {
      const newChild: LibraryContainerMetadataWithUniqueId = {
        ...child,
        id: `${child.id}----${idx}`,
        originalId: child.id,
      };
      return newChild;
    });
    return setOrderedChildren(newChildren || []);
  }, [children, setOrderedChildren]);

  const handleChildClick = useCallback((child: LibraryContainerMetadataWithUniqueId, numberOfClicks: number) => {
    const doubleClicked = numberOfClicks > 1;
    if (!doubleClicked) {
      navigateTo({ selectedItemId: child.originalId });
    } else {
      navigateTo({ containerId: child.originalId });
    }
  }, [navigateTo]);

  const getComponentStyle = useCallback((childId: string) => {
    const style: { marginBottom: string, borderRadius: string, outline?: string } = {
      marginBottom: '1rem',
      borderRadius: '8px',
    };
    if (activeDraggingId === childId) {
      style.outline = '2px dashed gray';
    }
    return style;
  }, [activeDraggingId]);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    // istanbul ignore next
    return <ErrorAlert error={error} />;
  }

  return (
    <div className="ml-2 library-container-children">
      {children?.length === 0 && (
        <h4 className="ml-2">
          {containerType === ContainerType.Section ? (
            <FormattedMessage {...sectionMessages.noChildrenText} />
          ) : (
            <FormattedMessage {...subsectionMessages.noChildrenText} />
          )}
        </h4>
      )}
      <DraggableList
        itemList={orderedChildren}
        setState={setOrderedChildren}
        updateOrder={handleReorder}
        activeId={activeDraggingId}
        setActiveId={setActiveDraggingId}
      >
        {orderedChildren?.map((child) => (
          // A container can have multiple instances of the same block
          // eslint-disable-next-line react/no-array-index-key
          <SortableItem
            id={child.id}
            key={child.id}
            componentStyle={getComponentStyle(child.id)}
            actionStyle={{
              padding: '0.5rem 1rem',
              background: '#FBFAF9',
              borderRadius: '8px',
              borderLeft: '8px solid #E1DDDB',
            }}
            isClickable={!readOnly}
            onClick={(e) => !readOnly && handleChildClick(child, e.detail)}
            disabled={readOnly || libReadOnly}
            cardClassName={sidebarItemInfo?.id === child.originalId ? 'selected' : undefined}
            actions={(
              <ContainerRow
                containerKey={containerKey}
                container={child}
                readOnly={readOnly || libReadOnly}
              />
            )}
          />

        ))}
      </DraggableList>
    </div>
  );
};
