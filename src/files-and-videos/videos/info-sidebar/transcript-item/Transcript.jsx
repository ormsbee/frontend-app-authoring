import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  Button,
  Icon,
  IconButton,
  useToggle,
} from '@edx/paragon';
import { DeleteOutline } from '@edx/paragon/icons';
import { injectIntl, FormattedMessage, intlShape } from '@edx/frontend-platform/i18n';
import { isEmpty } from 'lodash';
import LanguageSelect from './LanguageSelect';
import TranscriptMenu from './TranscriptMenu';
import messages from './messages';
import FileInput, { useFileInput } from '../../../FileInput';

const Transcript = ({
  languages,
  transcript,
  previousSelection,
  handleTranscript,
  // injected
  intl,
}) => {
  const [isConfirmationOpen, openConfirmation, closeConfirmation] = useToggle();
  const [newLanguage, setNewLanguage] = useState(transcript);
  const language = transcript;

  const input = useFileInput({
    onAddFile: (file) => handleTranscript({
      file,
      language,
      newLanguage,
    }, 'upload'),
    setSelectedRows: () => {},
    setAddOpen: () => {},
  });

  const updateLangauge = (selected) => {
    setNewLanguage(selected);
    if (isEmpty(language)) {
      input.click();
    }
  };

  return (
    <>
      {isConfirmationOpen ? (
        <Card className="mb-2">
          <Card.Header title={(<FormattedMessage {...messages.deleteConfirmationHeader} />)} />
          <Card.Body>
            <Card.Section>
              <FormattedMessage {...messages.deleteConfirmationMessage} />
            </Card.Section>
            <Card.Footer>
              <Button variant="tertiary" className="mb-2 mb-sm-0" onClick={closeConfirmation}>
                <FormattedMessage {...messages.cancelDeleteLabel} />
              </Button>
              <Button
                variant="danger"
                className="mb-2 mb-sm-0"
                onClick={() => {
                  handleTranscript({ language: transcript }, 'delete');
                  closeConfirmation();
                }}
              >
                <FormattedMessage {...messages.confirmDeleteLabel} />
              </Button>
            </Card.Footer>
          </Card.Body>
        </Card>
      ) : (
        <div className="row m-0 align-items-center justify-content-between">
          <div className="col-10 p-0">
            <LanguageSelect
              options={languages}
              value={newLanguage}
              placeholderText={intl.formatMessage(messages.languageSelectPlaceholder)}
              previousSelection={previousSelection}
              handleSelect={updateLangauge}
            />
          </div>
          { transcript === '' ? (
            <IconButton
              iconAs={Icon}
              src={DeleteOutline}
              onClick={openConfirmation}
            />
          ) : (
            <TranscriptMenu
              {...{
                language,
                newLanguage,
                setNewLanguage,
                handleTranscript,
                input,
                launchDeleteConfirmation: openConfirmation,
              }}
            />
          )}
        </div>
      )}
      <FileInput key="transcript-input" fileInput={input} supportedFileFormats={['.srt']} />
    </>
  );
};

Transcript.propTypes = {
  languages: PropTypes.shape({}).isRequired,
  transcript: PropTypes.string.isRequired,
  previousSelection: PropTypes.arrayOf(PropTypes.string).isRequired,
  handleTranscript: PropTypes.func.isRequired,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(Transcript);