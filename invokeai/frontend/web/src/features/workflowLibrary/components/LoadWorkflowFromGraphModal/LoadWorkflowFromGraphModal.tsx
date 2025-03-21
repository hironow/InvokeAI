import {
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Textarea,
} from '@invoke-ai/ui-library';
import { useStore } from '@nanostores/react';
import { graphToWorkflow } from 'features/nodes/util/workflow/graphToWorkflow';
import { useLoadWorkflowWithDialog } from 'features/workflowLibrary/components/LoadWorkflowConfirmationAlertDialog';
import { atom } from 'nanostores';
import type { ChangeEvent } from 'react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

const $isOpen = atom<boolean>(false);

export const useLoadWorkflowFromGraphModal = () => {
  const isOpen = useStore($isOpen);
  const onOpen = useCallback(() => {
    $isOpen.set(true);
  }, []);
  const onClose = useCallback(() => {
    $isOpen.set(false);
  }, []);

  return { isOpen, onOpen, onClose };
};

export const LoadWorkflowFromGraphModal = () => {
  const { t } = useTranslation();
  const { isOpen, onClose } = useLoadWorkflowFromGraphModal();
  const loadWorkflowWithDialog = useLoadWorkflowWithDialog();
  const [graphRaw, setGraphRaw] = useState<string>('');
  const [unvalidatedWorkflow, setUnvalidatedWorkflow] = useState<unknown>();
  const [unvalidatedWorkflowAsString, setUnvalidatedWorkflowAsString] = useState<string>('');
  const [shouldAutoLayout, setShouldAutoLayout] = useState(true);
  const onChangeGraphRaw = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setGraphRaw(e.target.value);
  }, []);
  const onChangeWorkflowRaw = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setUnvalidatedWorkflow(e.target.value);
  }, []);
  const onChangeShouldAutoLayout = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setShouldAutoLayout(e.target.checked);
  }, []);
  const parse = useCallback(() => {
    const graph = JSON.parse(graphRaw);
    const workflow = graphToWorkflow(graph, shouldAutoLayout);
    setUnvalidatedWorkflow(workflow);
    setUnvalidatedWorkflowAsString(JSON.stringify(workflow, null, 2));
  }, [graphRaw, shouldAutoLayout]);
  const loadWorkflow = useCallback(async () => {
    await loadWorkflowWithDialog({ type: 'object', data: unvalidatedWorkflow });
    onClose();
  }, [loadWorkflowWithDialog, unvalidatedWorkflow, onClose]);
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered useInert={false}>
      <ModalOverlay />
      <ModalContent w="80vw" h="80vh" maxW="unset" maxH="unset">
        <ModalHeader>{t('workflows.loadFromGraph')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody as={Flex} flexDir="column" gap={4} w="full" h="full" pb={4}>
          <Flex gap={4}>
            <Button onClick={parse} size="sm" flexShrink={0}>
              {t('workflows.convertGraph')}
            </Button>
            <FormControl>
              <FormLabel>{t('workflows.autoLayout')}</FormLabel>
              <Checkbox isChecked={shouldAutoLayout} onChange={onChangeShouldAutoLayout} />
            </FormControl>
            <Spacer />
            <Button onClick={loadWorkflow} size="sm" flexShrink={0}>
              {t('workflows.loadWorkflow')}
            </Button>
          </Flex>
          <FormControl orientation="vertical" h="50%">
            <FormLabel>{t('nodes.graph')}</FormLabel>
            <Textarea
              h="full"
              value={graphRaw}
              fontFamily="monospace"
              whiteSpace="pre-wrap"
              overflowWrap="normal"
              onChange={onChangeGraphRaw}
            />
          </FormControl>
          <FormControl orientation="vertical" h="50%">
            <FormLabel>{t('nodes.workflow')}</FormLabel>
            <Textarea
              h="full"
              value={unvalidatedWorkflowAsString}
              fontFamily="monospace"
              whiteSpace="pre-wrap"
              overflowWrap="normal"
              onChange={onChangeWorkflowRaw}
            />
          </FormControl>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
