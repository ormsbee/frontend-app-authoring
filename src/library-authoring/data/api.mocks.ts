/* istanbul ignore file */
import { camelCaseObject } from '@edx/frontend-platform';
import { mockContentTaxonomyTagsData } from '../../content-tags-drawer/data/api.mocks';
import { ContainerType, getBlockType } from '../../generic/key-utils';
import { createAxiosError } from '../../testUtils';
import contentLibrariesListV2 from '../__mocks__/contentLibrariesListV2';
import downstreamLinkInfo from '../../search-manager/data/__mocks__/downstream-links.json';
import * as api from './api';
import * as courseLibApi from '../../course-libraries/data/api';

/**
 * Mock for `getContentLibraryV2List()`
 */
export const mockGetContentLibraryV2List = {
  applyMock: () => jest.spyOn(api, 'getContentLibraryV2List').mockResolvedValue(
    camelCaseObject(contentLibrariesListV2),
  ),
  applyMockError: () => jest.spyOn(api, 'getContentLibraryV2List').mockRejectedValue(
    createAxiosError({ code: 500, message: 'Internal Error.', path: api.getContentLibraryV2ListApiUrl() }),
  ),
  applyMockLoading: () => jest.spyOn(api, 'getContentLibraryV2List').mockResolvedValue(
    new Promise(() => {}),
  ),
  applyMockEmpty: () => jest.spyOn(api, 'getContentLibraryV2List').mockResolvedValue({
    next: null,
    previous: null,
    count: 0,
    numPages: 1,
    currentPage: 1,
    start: 0,
    results: [],
  }),
};

/**
 * Mock for `getContentLibrary()`
 *
 * This mock returns different data/responses depending on the ID of the library
 * that you request.
 */
export async function mockContentLibrary(libraryId: string): Promise<api.ContentLibrary> {
  // This mock has many different behaviors, depending on the library ID:
  switch (libraryId) {
    case mockContentLibrary.libraryIdThatNeverLoads:
      // Return a promise that never resolves, to simulate never loading:
      return new Promise<any>(() => {});
    case mockContentLibrary.library404:
      throw createAxiosError({ code: 400, message: 'Not found.', path: api.getContentLibraryApiUrl(libraryId) });
    case mockContentLibrary.library500:
      throw createAxiosError({ code: 500, message: 'Internal Error.', path: api.getContentLibraryApiUrl(libraryId) });
    case mockContentLibrary.libraryId:
      return mockContentLibrary.libraryData;
    case mockContentLibrary.libraryId2:
      return { ...mockContentLibrary.libraryData, id: mockContentLibrary.libraryId2, slug: 'TEST2' };
    case mockContentLibrary.libraryIdReadOnly:
      return {
        ...mockContentLibrary.libraryData,
        id: mockContentLibrary.libraryIdReadOnly,
        slug: 'readOnly',
        allowPublicRead: true,
        canEditLibrary: false,
      };
    case mockContentLibrary.libraryDraftWithoutUser:
      return {
        ...mockContentLibrary.libraryData,
        id: mockContentLibrary.libraryDraftWithoutUser,
        slug: 'draftNoUser',
        lastDraftCreatedBy: null,
      };
    case mockContentLibrary.libraryNoDraftDate:
      return {
        ...mockContentLibrary.libraryData,
        id: mockContentLibrary.libraryNoDraftDate,
        slug: 'noDraftDate',
        lastDraftCreated: null,
      };
    case mockContentLibrary.libraryNoDraftNoCrateDate:
      return {
        ...mockContentLibrary.libraryData,
        id: mockContentLibrary.libraryNoDraftNoCrateDate,
        slug: 'noDraftNoCreateDate',
        lastDraftCreated: null,
        created: null,
      };
    case mockContentLibrary.libraryUnpublishedChanges:
      return {
        ...mockContentLibrary.libraryData,
        id: mockContentLibrary.libraryUnpublishedChanges,
        slug: 'unpublishedChanges',
        lastPublished: '2024-07-26T16:37:42Z',
        hasUnpublishedChanges: true,
      };
    case mockContentLibrary.libraryPublished:
      return {
        ...mockContentLibrary.libraryData,
        id: mockContentLibrary.libraryPublished,
        slug: 'published',
        lastPublished: '2024-07-26T16:37:42Z',
        hasUnpublishedChanges: false,
        publishedBy: 'staff',
      };
    case mockContentLibrary.libraryPublishedWithoutUser:
      return {
        ...mockContentLibrary.libraryData,
        id: mockContentLibrary.libraryPublishedWithoutUser,
        slug: 'publishedWithUser',
        lastPublished: '2024-07-26T16:37:42Z',
        hasUnpublishedChanges: false,
        publishedBy: null,
      };
    case mockContentLibrary.libraryDraftWithoutChanges:
      return {
        ...mockContentLibrary.libraryData,
        id: mockContentLibrary.libraryDraftWithoutChanges,
        slug: 'draftNoChanges',
        numBlocks: 0,
      };
    case mockContentLibrary.libraryFromList:
      return {
        ...mockContentLibrary.libraryData,
        id: mockContentLibrary.libraryFromList,
        slug: 'TL1',
        org: 'SampleTaxonomyOrg1',
        title: 'Test Library 1',
      };
    default:
      throw new Error(`mockContentLibrary: unknown library ID "${libraryId}"`);
  }
}
mockContentLibrary.libraryId = 'lib:Axim:TEST';
mockContentLibrary.libraryData = {
  // This is captured from a real API response:
  id: mockContentLibrary.libraryId,
  type: 'complex', // 'type' is a deprecated field; don't use it.
  org: 'Axim',
  slug: 'TEST',
  title: 'Test Library',
  description: 'A library for testing',
  numBlocks: 10,
  version: 18,
  lastPublished: null, // or e.g. '2024-08-30T16:37:42Z',
  publishedBy: null, // or e.g. 'test_author',
  lastDraftCreated: '2024-07-22T21:37:49Z',
  lastDraftCreatedBy: 'staff',
  allowLti: false,
  allowPublicLearning: false,
  allowPublicRead: false,
  hasUnpublishedChanges: true,
  hasUnpublishedDeletes: false,
  license: '',
  canEditLibrary: true,
  created: '2024-06-26T14:19:59Z',
  updated: '2024-07-20T17:36:51Z',
} satisfies api.ContentLibrary;
mockContentLibrary.libraryId2 = 'lib:Axim:TEST2';
mockContentLibrary.libraryIdReadOnly = 'lib:Axim:readOnly';
mockContentLibrary.libraryIdThatNeverLoads = 'lib:Axim:infiniteLoading';
mockContentLibrary.library404 = 'lib:Axim:error404';
mockContentLibrary.library500 = 'lib:Axim:error500';
mockContentLibrary.libraryDraftWithoutUser = 'lib:Axim:draftNoUser';
mockContentLibrary.libraryNoDraftDate = 'lib:Axim:noDraftDate';
mockContentLibrary.libraryNoDraftNoCrateDate = 'lib:Axim:noDraftNoCreateDate';
mockContentLibrary.libraryUnpublishedChanges = 'lib:Axim:unpublishedChanges';
mockContentLibrary.libraryPublished = 'lib:Axim:published';
mockContentLibrary.libraryPublishedWithoutUser = 'lib:Axim:publishedWithoutUser';
mockContentLibrary.libraryDraftWithoutChanges = 'lib:Axim:draftNoChanges';
mockContentLibrary.libraryFromList = 'lib:SampleTaxonomyOrg1:TL1';
mockContentLibrary.applyMock = () => jest.spyOn(api, 'getContentLibrary').mockImplementation(mockContentLibrary);

/**
 * Mock for `createLibraryBlock()`
 */
export async function mockCreateLibraryBlock(
  args: api.CreateBlockDataRequest,
): ReturnType<typeof api.createLibraryBlock> {
  if (args.libraryId === mockContentLibrary.libraryId) {
    switch (args.blockType) {
      case 'html': return mockCreateLibraryBlock.newHtmlData;
      case 'problem': return mockCreateLibraryBlock.newProblemData;
      case 'video': return mockCreateLibraryBlock.newVideoData;
      default:
        // Continue to error handling below.
    }
  }
  throw new Error(`mockCreateLibraryBlock doesn't know how to mock ${JSON.stringify(args)}`);
}
mockCreateLibraryBlock.newHtmlData = {
  id: 'lb:Axim:TEST:html:123',
  blockType: 'html',
  displayName: 'New Text Component',
  publishedDisplayName: null,
  hasUnpublishedChanges: true,
  lastPublished: null, // or e.g. '2024-08-30T16:37:42Z',
  publishedBy: null, // or e.g. 'test_author',
  lastDraftCreated: '2024-07-22T21:37:49Z',
  lastDraftCreatedBy: null,
  created: '2024-07-22T21:37:49Z',
  modified: '2024-07-22T21:37:49Z',
  tagsCount: 0,
  collections: [],
} satisfies api.LibraryBlockMetadata;
mockCreateLibraryBlock.newProblemData = {
  id: 'lb:Axim:TEST:problem:prob1',
  blockType: 'problem',
  displayName: 'New Problem',
  publishedDisplayName: null,
  hasUnpublishedChanges: true,
  lastPublished: null, // or e.g. '2024-08-30T16:37:42Z',
  publishedBy: null, // or e.g. 'test_author',
  lastDraftCreated: '2024-07-22T21:37:49Z',
  lastDraftCreatedBy: null,
  created: '2024-07-22T21:37:49Z',
  modified: '2024-07-22T21:37:49Z',
  tagsCount: 0,
  collections: [],
} satisfies api.LibraryBlockMetadata;
mockCreateLibraryBlock.newVideoData = {
  id: 'lb:Axim:TEST:video:vid1',
  blockType: 'video',
  displayName: 'New Video',
  publishedDisplayName: null,
  hasUnpublishedChanges: true,
  lastPublished: null, // or e.g. '2024-08-30T16:37:42Z',
  publishedBy: null, // or e.g. 'test_author',
  lastDraftCreated: '2024-07-22T21:37:49Z',
  lastDraftCreatedBy: null,
  created: '2024-07-22T21:37:49Z',
  modified: '2024-07-22T21:37:49Z',
  tagsCount: 0,
  collections: [],
} satisfies api.LibraryBlockMetadata;
/** Apply this mock. Returns a spy object that can tell you if it's been called. */
mockCreateLibraryBlock.applyMock = () => (
  jest.spyOn(api, 'createLibraryBlock').mockImplementation(mockCreateLibraryBlock)
);

/**
 * Mock for `deleteLibraryBlock()`
 */
export async function mockDeleteLibraryBlock(): ReturnType<typeof api.deleteLibraryBlock> {
  // no-op
}
/** Apply this mock. Returns a spy object that can tell you if it's been called. */
mockDeleteLibraryBlock.applyMock = () => (
  jest.spyOn(api, 'deleteLibraryBlock').mockImplementation(mockDeleteLibraryBlock)
);

/**
 * Mock for `restoreLibraryBlock()`
 */
export async function mockRestoreLibraryBlock(): ReturnType<typeof api.restoreLibraryBlock> {
  // no-op
}
/** Apply this mock. Returns a spy object that can tell you if it's been called. */
mockRestoreLibraryBlock.applyMock = () => (
  jest.spyOn(api, 'restoreLibraryBlock').mockImplementation(mockRestoreLibraryBlock)
);

/**
 * Mock for `getXBlockFields()`
 *
 * This mock returns different data/responses depending on the ID of the block
 * that you request. Use `mockXBlockFields.applyMock()` to apply it to the whole
 * test suite.
 */
export async function mockXBlockFields(usageKey: string): Promise<api.XBlockFields> {
  const thisMock = mockXBlockFields;
  switch (usageKey) {
    case thisMock.usageKeyHtml: return thisMock.dataHtml;
    case thisMock.usageKeyNewHtml: return thisMock.dataNewHtml;
    case thisMock.usageKeyNewProblem: return thisMock.dataNewProblem;
    case thisMock.usageKeyNewVideo: return thisMock.dataNewVideo;
    case thisMock.usageKeyThirdParty: return thisMock.dataThirdParty;
    case thisMock.usageKey0: return thisMock.dataHtml0;
    default: throw new Error(`No mock has been set up for usageKey "${usageKey}"`);
  }
}
// Mock of a "regular" HTML (Text) block:
mockXBlockFields.usageKeyHtml = 'lb:Axim:TEST:html:571fe018-f3ce-45c9-8f53-5dafcb422fdd';
mockXBlockFields.dataHtml = {
  displayName: 'Introduction to Testing',
  data: '<p>This is a text component which uses <strong>HTML</strong>.</p>',
  metadata: { displayName: 'Introduction to Testing' },
} satisfies api.XBlockFields;
// Mock of another "regular" HTML (Text) block:
mockXBlockFields.usageKey0 = 'lb:org1:Demo_course:html:text-0';
mockXBlockFields.dataHtml0 = {
  displayName: 'text block 0',
  data: '<p>This is a text component which uses <strong>HTML</strong>.</p>',
  metadata: { displayName: 'text block 0' },
} satisfies api.XBlockFields;
// Mock of a blank/new HTML (Text) block:
mockXBlockFields.usageKeyNewHtml = 'lb:Axim:TEST:html:123';
mockXBlockFields.dataNewHtml = {
  displayName: 'New Text Component',
  data: '',
  metadata: { displayName: 'New Text Component' },
} satisfies api.XBlockFields;
// Mock of a blank/new problem (CAPA) block:
mockXBlockFields.usageKeyNewProblem = 'lb:Axim:TEST:problem:prob1';
mockXBlockFields.dataNewProblem = {
  displayName: 'New Problem Component',
  data: '',
  metadata: { displayName: 'New Problem Component' },
} satisfies api.XBlockFields;
mockXBlockFields.usageKeyNewVideo = 'lb:Axim:TEST:video:vid1';
mockXBlockFields.dataNewVideo = {
  displayName: 'New Video',
  data: '',
  metadata: { displayName: 'New Video' },
} satisfies api.XBlockFields;
mockXBlockFields.usageKeyThirdParty = 'lb:Axim:TEST:third_party:12345';
mockXBlockFields.dataThirdParty = {
  displayName: 'Third party XBlock',
  data: '',
  metadata: { displayName: 'Third party XBlock' },
} satisfies api.XBlockFields;
/** Apply this mock. Returns a spy object that can tell you if it's been called. */
mockXBlockFields.applyMock = () => jest.spyOn(api, 'getXBlockFields').mockImplementation(mockXBlockFields);

/**
 * Mock for `getLibraryBlockMetadata()`
 *
 * This mock returns different data/responses depending on the ID of the block
 * that you request. Use `mockLibraryBlockMetadata.applyMock()` to apply it to the whole
 * test suite.
 */
export async function mockLibraryBlockMetadata(usageKey: string): Promise<api.LibraryBlockMetadata> {
  const thisMock = mockLibraryBlockMetadata;
  switch (usageKey) {
    case thisMock.usageKeyThatNeverLoads:
      // Return a promise that never resolves, to simulate never loading:
      return new Promise<any>(() => {});
    case thisMock.usageKeyError404:
      throw createAxiosError({ code: 404, message: 'Not found.', path: api.getLibraryBlockMetadataUrl(usageKey) });
    case thisMock.usageKeyNeverPublished: return thisMock.dataNeverPublished;
    case thisMock.usageKeyPublished: return thisMock.dataPublished;
    case thisMock.usageKeyWithCollections: return thisMock.dataWithCollections;
    case thisMock.usageKeyPublishDisabled: return thisMock.dataPublishDisabled;
    case thisMock.usageKeyUnsupportedXBlock: return thisMock.dataUnsupportedXBlock;
    case thisMock.usageKeyForTags: return thisMock.dataPublished;
    case thisMock.usageKeyPublishedWithChanges: return thisMock.dataPublishedWithChanges;
    case thisMock.usageKeyPublishedWithChangesV2: return thisMock.dataPublishedWithChanges;
    default: throw new Error(`No mock has been set up for usageKey "${usageKey}"`);
  }
}
mockLibraryBlockMetadata.usageKeyThatNeverLoads = 'lb:Axim:infiniteLoading:html:123';
mockLibraryBlockMetadata.usageKeyError404 = 'lb:Axim:error404:html:123';
mockLibraryBlockMetadata.usageKeyNeverPublished = 'lb:Axim:TEST1:html:571fe018-f3ce-45c9-8f53-5dafcb422fd1';
mockLibraryBlockMetadata.dataNeverPublished = {
  id: 'lb:Axim:TEST1:html:571fe018-f3ce-45c9-8f53-5dafcb422fd1',
  blockType: 'html',
  displayName: 'Introduction to Testing 1',
  publishedDisplayName: null,
  lastPublished: null,
  publishedBy: null,
  lastDraftCreated: null,
  lastDraftCreatedBy: null,
  hasUnpublishedChanges: false,
  created: '2024-06-20T13:54:21Z',
  modified: '2024-06-21T13:54:21Z',
  tagsCount: 0,
  collections: [],
} satisfies api.LibraryBlockMetadata;
mockLibraryBlockMetadata.usageKeyPublished = 'lb:Axim:TEST2:html:571fe018-f3ce-45c9-8f53-5dafcb422fd2';
mockLibraryBlockMetadata.dataPublished = {
  id: 'lb:Axim:TEST2:html:571fe018-f3ce-45c9-8f53-5dafcb422fd2',
  blockType: 'html',
  displayName: 'Introduction to Testing 2',
  publishedDisplayName: 'Introduction to Testing 2',
  lastPublished: '2024-06-22T00:00:00',
  publishedBy: 'Luke',
  lastDraftCreated: null,
  lastDraftCreatedBy: '2024-06-20T20:00:00Z',
  hasUnpublishedChanges: false,
  created: '2024-06-20T13:54:21Z',
  modified: '2024-06-21T13:54:21Z',
  tagsCount: 0,
  collections: [],
} satisfies api.LibraryBlockMetadata;
mockLibraryBlockMetadata.usageKeyPublishDisabled = 'lb:Axim:TEST2-disabled:html:571fe018-f3ce-45c9-8f53-5dafcb422fd2';
mockLibraryBlockMetadata.dataPublishDisabled = {
  ...mockLibraryBlockMetadata.dataPublished,
  id: mockLibraryBlockMetadata.usageKeyPublishDisabled,
  modified: '2024-06-11T13:54:21Z',
} satisfies api.LibraryBlockMetadata;
mockLibraryBlockMetadata.usageKeyUnsupportedXBlock = 'lb:Axim:TEST:conditional:12345';
mockLibraryBlockMetadata.dataUnsupportedXBlock = {
  ...mockLibraryBlockMetadata.dataPublished,
  id: mockLibraryBlockMetadata.usageKeyUnsupportedXBlock,
  blockType: 'conditional',
} satisfies api.LibraryBlockMetadata;
mockLibraryBlockMetadata.usageKeyForTags = mockContentTaxonomyTagsData.largeTagsId;
mockLibraryBlockMetadata.usageKeyWithCollections = 'lb:Axim:TEST:html:571fe018-f3ce-45c9-8f53-5dafcb422fdd';
mockLibraryBlockMetadata.dataWithCollections = {
  id: 'lb:Axim:TEST:html:571fe018-f3ce-45c9-8f53-5dafcb422fdd',
  blockType: 'html',
  displayName: 'Introduction to Testing 2',
  publishedDisplayName: null,
  lastPublished: '2024-06-21T00:00:00',
  publishedBy: 'Luke',
  lastDraftCreated: null,
  lastDraftCreatedBy: '2024-06-20T20:00:00Z',
  hasUnpublishedChanges: false,
  created: '2024-06-20T13:54:21Z',
  modified: '2024-06-21T13:54:21Z',
  tagsCount: 0,
  collections: [{ title: 'My first collection', key: 'my-first-collection' }],
} satisfies api.LibraryBlockMetadata;
mockLibraryBlockMetadata.usageKeyPublishedWithChanges = 'lb:Axim:TEST:html:571fe018-f3ce-45c9-8f53-5dafcb422fvv';
mockLibraryBlockMetadata.usageKeyPublishedWithChangesV2 = 'lb:Axim:TEST:html:571fe018-f3ce-45c9-8f53-5dafcb422fv2';
mockLibraryBlockMetadata.dataPublishedWithChanges = {
  id: 'lb:Axim:TEST2:html:571fe018-f3ce-45c9-8f53-5dafcb422fvv',
  blockType: 'html',
  displayName: 'Introduction to Testing 2',
  publishedDisplayName: 'Introduction to Testing 3',
  lastPublished: '2024-06-22T00:00:00',
  publishedBy: 'Luke',
  lastDraftCreated: null,
  lastDraftCreatedBy: '2024-06-20T20:00:00Z',
  hasUnpublishedChanges: true,
  created: '2024-06-20T13:54:21Z',
  modified: '2024-06-23T13:54:21Z',
  tagsCount: 0,
  collections: [],
} satisfies api.LibraryBlockMetadata;
/** Apply this mock. Returns a spy object that can tell you if it's been called. */
mockLibraryBlockMetadata.applyMock = () => jest.spyOn(api, 'getLibraryBlockMetadata').mockImplementation(mockLibraryBlockMetadata);

/**
 * Mock for `getCollectionMetadata()`
 *
 * This mock returns a fixed response for the collection ID *collection_1*.
 */
export async function mockGetCollectionMetadata(libraryId: string, collectionId: string): Promise<api.Collection> {
  switch (collectionId) {
    case mockGetCollectionMetadata.collectionIdError:
      throw createAxiosError({
        code: 404,
        message: 'Not found.',
        path: api.getLibraryCollectionApiUrl(libraryId, collectionId),
      });
    case mockGetCollectionMetadata.collectionIdLoading:
      return new Promise(() => {});
    default:
      return Promise.resolve(mockGetCollectionMetadata.collectionData);
  }
}
mockGetCollectionMetadata.collectionId = 'collection_1';
mockGetCollectionMetadata.collectionIdError = 'collection_error';
mockGetCollectionMetadata.collectionIdLoading = 'collection_loading';
mockGetCollectionMetadata.collectionData = {
  id: 1,
  key: 'collection_1',
  title: 'Test Collection',
  description: 'A collection for testing',
  created: '2024-09-19T10:00:00Z',
  createdBy: 'test_author',
  modified: '2024-09-20T11:00:00Z',
  learningPackage: 11,
  enabled: true,
} satisfies api.Collection;
/** Apply this mock. Returns a spy object that can tell you if it's been called. */
mockGetCollectionMetadata.applyMock = () => {
  jest.spyOn(api, 'getCollectionMetadata').mockImplementation(mockGetCollectionMetadata);
};

/**
 * Mock for `getContainerMetadata()`
 *
 * This mock returns a fixed response for the container ID *container_1*.
 */
export async function mockGetContainerMetadata(containerId: string): Promise<api.Container> {
  switch (containerId) {
    case mockGetContainerMetadata.unitIdError:
    case mockGetContainerMetadata.sectionIdError:
    case mockGetContainerMetadata.subsectionIdError:
      throw createAxiosError({
        code: 404,
        message: 'Not found.',
        path: api.getLibraryContainerApiUrl(containerId),
      });
    case mockGetContainerMetadata.unitIdLoading:
    case mockGetContainerMetadata.sectionIdLoading:
    case mockGetContainerMetadata.subsectionIdLoading:
      return new Promise(() => { });
    case mockGetContainerMetadata.unitIdWithCollections:
      return Promise.resolve(mockGetContainerMetadata.containerDataWithCollections);
    case mockGetContainerMetadata.sectionId:
    case mockGetContainerMetadata.sectionIdEmpty:
      return Promise.resolve(mockGetContainerMetadata.sectionData);
    case mockGetContainerMetadata.subsectionId:
    case mockGetContainerMetadata.subsectionIdEmpty:
      return Promise.resolve(mockGetContainerMetadata.subsectionData);
    default:
      return Promise.resolve(mockGetContainerMetadata.containerData);
  }
}
mockGetContainerMetadata.unitId = 'lct:org:lib:unit:test-unit-9a207';
mockGetContainerMetadata.unitIdEmpty = 'lct:org:lib:unit:test-unit-empty';
mockGetContainerMetadata.sectionId = 'lct:org:lib:section:test-section-1';
mockGetContainerMetadata.subsectionId = 'lb:org1:Demo_course:subsection:subsection-0';
mockGetContainerMetadata.sectionIdEmpty = 'lct:org:lib:section:test-section-empty';
mockGetContainerMetadata.subsectionIdEmpty = 'lb:org1:Demo_course:subsection:subsection-empty';
mockGetContainerMetadata.unitIdError = 'lct:org:lib:unit:container_error';
mockGetContainerMetadata.sectionIdError = 'lct:org:lib:section:section_error';
mockGetContainerMetadata.subsectionIdError = 'lct:org:lib:section:section_error';
mockGetContainerMetadata.unitIdLoading = 'lct:org:lib:unit:container_loading';
mockGetContainerMetadata.sectionIdLoading = 'lct:org:lib:section:section_loading';
mockGetContainerMetadata.subsectionIdLoading = 'lct:org:lib:subsection:subsection_loading';
mockGetContainerMetadata.unitIdForTags = mockContentTaxonomyTagsData.containerTagsId;
mockGetContainerMetadata.unitIdWithCollections = 'lct:org:lib:unit:container_collections';
mockGetContainerMetadata.containerData = {
  id: 'lct:org:lib:unit:test-unit-9a2072',
  containerType: ContainerType.Unit,
  displayName: 'Test Unit',
  publishedDisplayName: 'Published Test Unit',
  created: '2024-09-19T10:00:00Z',
  createdBy: 'test_author',
  lastPublished: '2024-09-20T10:00:00Z',
  publishedBy: 'test_publisher',
  lastDraftCreated: '2024-09-20T10:00:00Z',
  lastDraftCreatedBy: 'test_author',
  modified: '2024-09-20T11:00:00Z',
  hasUnpublishedChanges: true,
  collections: [],
  tagsCount: 0,
} satisfies api.Container;
mockGetContainerMetadata.sectionData = {
  ...mockGetContainerMetadata.containerData,
  id: 'lct:org:lib:section:test-section-1',
  containerType: ContainerType.Section,
  displayName: 'Test section',
  publishedDisplayName: 'Test section',
} satisfies api.Container;
mockGetContainerMetadata.subsectionData = {
  ...mockGetContainerMetadata.containerData,
  id: 'lb:org1:Demo_course:subsection:subsection-0',
  containerType: ContainerType.Subsection,
  displayName: 'Test subsection',
  publishedDisplayName: 'Test subsection',
} satisfies api.Container;
mockGetContainerMetadata.containerDataWithCollections = {
  ...mockGetContainerMetadata.containerData,
  id: mockGetContainerMetadata.unitIdWithCollections,
  collections: [{ title: 'My first collection', key: 'my-first-collection' }],
} satisfies api.Container;
/** Apply this mock. Returns a spy object that can tell you if it's been called. */
mockGetContainerMetadata.applyMock = () => {
  jest.spyOn(api, 'getContainerMetadata').mockImplementation(mockGetContainerMetadata);
};

/**
 * Mock for `getLibraryContainerChildren()`
 *
 * This mock returns a fixed response for the given container ID.
 */
export async function mockGetContainerChildren(containerId: string): Promise<api.LibraryBlockMetadata[]> {
  let numChildren: number;
  switch (containerId) {
    case mockGetContainerMetadata.unitId:
    case mockGetContainerMetadata.sectionId:
    case mockGetContainerMetadata.subsectionId:
      numChildren = 3;
      break;
    case mockGetContainerChildren.fiveChildren:
      numChildren = 5;
      break;
    case mockGetContainerChildren.sixChildren:
      numChildren = 6;
      break;
    default:
      numChildren = 0;
      break;
  }
  let blockType = 'html';
  let name = 'text';
  if (containerId.includes('subsection')) {
    blockType = 'unit';
    name = blockType;
  } else if (containerId.includes('section')) {
    blockType = 'subsection';
    name = blockType;
  }
  return Promise.resolve(
    Array(numChildren).fill(mockGetContainerChildren.childTemplate).map((child, idx) => (
      {
        ...child,
        // Generate a unique ID for each child block to avoid "duplicate key" errors in tests
        id: `lb:org1:Demo_course:${blockType}:${name}-${idx}`,
        displayName: `${name} block ${idx}`,
        publishedDisplayName: `${name} block published ${idx}`,
      }
    )),
  );
}
mockGetContainerChildren.fiveChildren = 'lct:org1:Demo_Course:unit:unit-5';
mockGetContainerChildren.sixChildren = 'lct:org1:Demo_Course:unit:unit-6';
mockGetContainerChildren.childTemplate = {
  id: 'lb:org1:Demo_course:html:text',
  blockType: 'html',
  displayName: 'text block',
  publishedDisplayName: 'text block published',
  lastPublished: null,
  publishedBy: null,
  lastDraftCreated: null,
  lastDraftCreatedBy: null,
  hasUnpublishedChanges: false,
  created: null,
  modified: null,
  tagsCount: 0,
  collections: [] as api.CollectionMetadata[],
} satisfies api.LibraryBlockMetadata;
/** Apply this mock. Returns a spy object that can tell you if it's been called. */
mockGetContainerChildren.applyMock = () => {
  jest.spyOn(api, 'getLibraryContainerChildren').mockImplementation(mockGetContainerChildren);
};

/**
 * Mock for `getXBlockOLX()`
 *
 * This mock returns different data/responses depending on the ID of the block
 * that you request. Use `mockXBlockOLX.applyMock()` to apply it to the whole
 * test suite.
 */
export async function mockXBlockOLX(usageKey: string): Promise<string> {
  const thisMock = mockXBlockOLX;
  switch (usageKey) {
    case thisMock.usageKeyHtml: return thisMock.olxHtml;
    default: {
      const blockType = getBlockType(usageKey);
      return `<${blockType}>This is mock OLX for usageKey "${usageKey}"</${blockType}>`;
    }
  }
}
// Mock of a "regular" HTML (Text) block:
mockXBlockOLX.usageKeyHtml = mockXBlockFields.usageKeyHtml;
mockXBlockOLX.olxHtml = `
  <html display_name="${mockXBlockFields.dataHtml.displayName}">
    ${mockXBlockFields.dataHtml.data}
  </html>
`;
/** Apply this mock. Returns a spy object that can tell you if it's been called. */
mockXBlockOLX.applyMock = () => jest.spyOn(api, 'getXBlockOLX').mockImplementation(mockXBlockOLX);

/**
 * Mock for `setXBlockOLX()`
 */
export async function mockSetXBlockOLX(_usageKey: string, newOLX: string): Promise<string> {
  return newOLX;
}
/** Apply this mock. Returns a spy object that can tell you if it's been called. */
mockSetXBlockOLX.applyMock = () => jest.spyOn(api, 'setXBlockOLX').mockImplementation(mockSetXBlockOLX);

/**
 * Mock for `getXBlockAssets()`
 *
 * Use `getXBlockAssets.applyMock()` to apply it to the whole test suite.
 */
export async function mockXBlockAssets(): ReturnType<typeof api['getXBlockAssets']> {
  return [
    { path: 'static/image1.png', url: 'https://cdn.test.none/image1.png', size: 12_345_000 },
    { path: 'static/data.csv', url: 'https://cdn.test.none/data.csv', size: 8_000 },
  ];
}
/** Apply this mock. Returns a spy object that can tell you if it's been called. */
mockXBlockAssets.applyMock = () => jest.spyOn(api, 'getXBlockAssets').mockImplementation(mockXBlockAssets);

/**
 * Mock for `getLibraryTeam()`
 *
 * Use `mockGetLibraryTeam.applyMock()` to apply it to the whole test suite.
 */
export async function mockGetLibraryTeam(libraryId: string): Promise<api.LibraryTeamMember[]> {
  switch (libraryId) {
    case mockContentLibrary.libraryIdThatNeverLoads:
      // Return a promise that never resolves, to simulate never loading:
      return new Promise<any>(() => {});
    default:
      return [
        mockGetLibraryTeam.adminMember,
        mockGetLibraryTeam.authorMember,
        mockGetLibraryTeam.readerMember,
      ];
  }
}
mockGetLibraryTeam.adminMember = {
  username: 'admin-user',
  email: 'admin@domain.tld',
  accessLevel: 'admin' as api.LibraryAccessLevel,
};
mockGetLibraryTeam.authorMember = {
  username: 'author-user',
  email: 'author@domain.tld',
  accessLevel: 'author' as api.LibraryAccessLevel,
};
mockGetLibraryTeam.readerMember = {
  username: 'reader-user',
  email: 'reader@domain.tld',
  accessLevel: 'read' as api.LibraryAccessLevel,
};
mockGetLibraryTeam.notMember = {
  username: 'not-user',
  email: 'not@domain.tld',
};

/** Apply this mock. Returns a spy object that can tell you if it's been called. */
mockGetLibraryTeam.applyMock = () => jest.spyOn(api, 'getLibraryTeam').mockImplementation(mockGetLibraryTeam);

/**
 * Mock for `getBlockTypes()`
 *
 * Use `mockBlockTypesMetadata.applyMock()` to apply it to the whole test suite.
 */
export async function mockBlockTypesMetadata(libraryId: string): Promise<api.BlockTypeMetadata[]> {
  const thisMock = mockBlockTypesMetadata;
  switch (libraryId) {
    case mockContentLibrary.libraryId: return thisMock.blockTypesMetadata;
    default: {
      return [];
    }
  }
}

mockBlockTypesMetadata.blockTypesMetadata = [
  { blockType: 'poll', displayName: 'Poll' },
  { blockType: 'survey', displayName: 'Survey' },
  { blockType: 'google-document', displayName: 'Google Document' },
];
/** Apply this mock. Returns a spy object that can tell you if it's been called. */
mockBlockTypesMetadata.applyMock = () => jest.spyOn(api, 'getBlockTypes').mockImplementation(mockBlockTypesMetadata);

export async function mockGetEntityLinks(
  _downstreamContextKey?: string,
  _readyToSync?: boolean,
  upstreamUsageKey?: string,
): ReturnType<typeof courseLibApi.getEntityLinks> {
  const thisMock = mockGetEntityLinks;
  switch (upstreamUsageKey) {
    case thisMock.upstreamUsageKey: return thisMock.response;
    case mockLibraryBlockMetadata.usageKeyPublishedWithChanges: return thisMock.response;
    case thisMock.emptyUsageKey: return thisMock.emptyComponentUsage;
    default: return [];
  }
}
mockGetEntityLinks.upstreamUsageKey = mockLibraryBlockMetadata.usageKeyPublished;
mockGetEntityLinks.response = downstreamLinkInfo.results[0].hits.map((obj: { usageKey: any; }) => ({
  id: 875,
  upstreamContextTitle: 'CS problems 3',
  upstreamVersion: 10,
  readyToSync: true,
  upstreamUsageKey: mockLibraryBlockMetadata.usageKeyPublished,
  upstreamContextKey: 'lib:Axim:TEST2',
  downstreamUsageKey: obj.usageKey,
  downstreamContextKey: 'course-v1:OpenEdx+DemoX+CourseX',
  versionSynced: 2,
  versionDeclined: null,
  created: '2025-02-08T14:07:05.588484Z',
  updated: '2025-02-08T14:07:05.588484Z',
}));
mockGetEntityLinks.emptyUsageKey = 'lb:Axim:TEST1:html:empty';
mockGetEntityLinks.emptyComponentUsage = [] as courseLibApi.PublishableEntityLink[];

mockGetEntityLinks.applyMock = () => jest.spyOn(
  courseLibApi,
  'getEntityLinks',
).mockImplementation(mockGetEntityLinks);
