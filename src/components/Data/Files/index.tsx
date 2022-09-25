import React, { useContext, useCallback, useState } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import Lightbox from 'react-image-lightbox'
import Button from '@mui/material/Button'
import { v1 as uuidv1 } from 'uuid'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../storeContext'
import Uploader from '../../Uploader'
import FileComponent from './File'
import 'react-image-lightbox/style.css'
import isImageFile from './isImageFile'
import ErrorBoundary from '../../shared/ErrorBoundary'
import mutations from '../../../utils/mutations'
import constants from '../../../utils/constants'
import { dexie, File } from '../../../dexieClient'

const TitleRow = styled.div`
  background-color: rgba(248, 243, 254, 1);
  flex-shrink: 0;
  display: flex;
  height: ${constants.titleRowHeight}px;
  justify-content: space-between;
  margin-left: -10px;
  margin-right: -10px;
  ${(props) => props['data-margin-bottom'] && 'margin-bottom: 15px;'}
  padding: 0 10px;
  user-select: none;
  position: sticky;
  top: 0;
  z-index: 1;
`
const Title = styled.div`
  font-weight: bold;
  margin-top: auto;
  margin-bottom: auto;
`
// center buttons
const Buttons = styled.div`
  margin-top: 7px;
`
const Spacer = styled.div`
  height: 10px;
`
const LightboxButton = styled(Button)`
  margin-left: 10px !important;
  text-transform: none !important;
  border: none !important;
`
const Content = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const Files = ({ parentTable, parent }) => {
  const store = useContext(StoreContext)
  const { online, gqlClient, addNotification } = store

  const [imageIndex, setImageIndex] = useState(0)
  const [lightboxIsOpen, setLightboxIsOpen] = useState(false)

  const files: File[] = useLiveQuery(
    async () => await dexie[`${parentTable}_files`].orderBy('name').toArray(),
    [parentTable],
  )

  const onChangeUploader = useCallback(
    async (file) => {
      if (file) {
        file.done(async (info) => {
          const newObject = {
            id: uuidv1(),
            file_id: info.uuid,
            file_mime_type: info.mimeType,
            [`${parentTable}_id`]: parent.id,
            name: info.name,
          }
          await dexie[`${parentTable}_file`].put(newObject)
          // TODO: need to add mutations for all file-tables
          const mutation = mutations[`mutateInsert_${parentTable}_file_one`]
          const variables = {
            object: newObject,
            on_conflict: {
              constraint: `${parentTable}_file_pkey`,
              update_columns: ['id'],
            },
          }
          const response = await gqlClient
            .mutation(mutation, variables)
            .toPromise()
          if (response.error) {
            console.log(response.error)
            return addNotification({
              message: response.error.message,
            })
          }
        })
      }
    },
    [parentTable, parent.id, gqlClient, addNotification],
  )

  const images = (files ?? []).filter((f) => isImageFile(f))
  const imageUrls = images.map(
    (f) =>
      `https://ucarecdn.com/${f.file_id}/-/resize/1200x/-/quality/lightest/${f.name}`,
  )
  const onClickLightboxButton = useCallback(() => setLightboxIsOpen(true), [])
  const onCloseLightboxRequest = useCallback(() => setLightboxIsOpen(false), [])
  const onMovePrevImageRequest = useCallback(
    () => setImageIndex((imageIndex + images.length - 1) % images.length),
    [imageIndex, images.length],
  )
  const onMoveNextImageRequest = useCallback(
    () => setImageIndex((imageIndex + 1) % images.length),
    [imageIndex, images.length],
  )

  if (!online) {
    return (
      <ErrorBoundary>
        <TitleRow data-online={online}>
          <Title>Dateien</Title>
          <Content>Sorry, nur online verfügbar</Content>
        </TitleRow>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <TitleRow
        data-online={online}
        data-margin-bottom={!!(files ?? []).length}
      >
        <Title>Dateien</Title>
        <Buttons>
          <Uploader
            id="file"
            name="file"
            onChange={onChangeUploader}
            content="test"
          />
          {!!images.length && (
            <LightboxButton
              color="primary"
              variant="outlined"
              onClick={onClickLightboxButton}
            >
              Bilder in Gallerie öffnen
            </LightboxButton>
          )}
        </Buttons>
      </TitleRow>
      {lightboxIsOpen && (
        <Lightbox
          mainSrc={imageUrls[imageIndex]}
          nextSrc={imageUrls[(imageIndex + 1) % images.length]}
          prevSrc={imageUrls[(imageIndex + images.length - 1) % images.length]}
          onCloseRequest={onCloseLightboxRequest}
          onMovePrevRequest={onMovePrevImageRequest}
          onMoveNextRequest={onMoveNextImageRequest}
          imageTitle={images[imageIndex].name || ''}
          imageCaption={images[imageIndex].beschreibung || ''}
          wrapperClassName="lightbox"
          nextLabel="Nächstes Bild"
          prevLabel="Voriges Bild"
        />
      )}
      {!!files && (
        <>
          <Spacer />
          {files.map((file) => (
            <FileComponent key={file.file_id} file={file} parent={parent} />
          ))}
        </>
      )}
    </ErrorBoundary>
  )
}

export default observer(Files)
