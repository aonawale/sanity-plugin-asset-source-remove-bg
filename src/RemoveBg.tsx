/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable camelcase */
/* eslint-disable react/jsx-no-bind */
import {Card, Dialog, Tab, TabList, TabPanel, ThemeProvider} from '@sanity/ui'
import {buildTheme} from '@sanity/ui/theme'
import React, {useEffect, useState} from 'react'

import {fetchCreditBalance, removeBackground} from './client'
import CreditBalance from './CreditBalance'
import Errors from './Errors'
import Form from './Form'
import {AccountResponse, ImageResponse, RemoveBgPayload, RemoveBgProps} from './types'

const studioTheme = buildTheme()

export default function RemoveBg({
  removeBg,
  photoRoom,
  onSelect,
  onClose,
  selectedAssets,
}: RemoveBgProps) {
  const [id, setId] = useState('action')
  const [account, setAccount] = useState<AccountResponse>()
  const [image, setImage] = useState<ImageResponse>()
  const {url} = selectedAssets[0]

  useEffect(() => {
    if (removeBg?.apiKey) {
      fetchCreditBalance(removeBg.apiKey).then(setAccount)
    }
  }, [])

  function onSubmit(data: RemoveBgPayload) {
    removeBackground({
      url: url,
      size: data.size,
      format: data.format,
      service: data.service,
      removeBg,
      photoRoom,
    }).then(setImage)
  }

  function handleDiscard() {
    setImage(undefined)
  }

  function handleUse() {
    onSelect([
      {
        value: image?.data?.url || '',
        kind: 'base64',
      },
    ])
  }

  return (
    <ThemeProvider theme={studioTheme}>
      <Dialog
        width={200}
        header={'Remove Background'}
        onClose={onClose}
        id={'remove-bg-dialog'}
        title={'Remove Background'}
      >
        <TabList space={2} padding={3}>
          <Tab
            aria-controls="action-panel"
            id="action-tab"
            label="Action"
            onClick={() => setId('action')}
            selected={id === 'action'}
          />
          <Tab
            aria-controls="credit-panel"
            id="credit-tab"
            label="Credit balance"
            onClick={() => setId('credit')}
            selected={id === 'credit'}
          />
        </TabList>
        <TabPanel aria-labelledby="action-tab" hidden={id !== 'action'} id="action-panel">
          <Card padding={4}>
            {image?.errors ? (
              <Errors errors={image.errors} onClick={() => setImage(undefined)} />
            ) : (
              <Form
                onSubmit={onSubmit}
                image={image}
                discardImage={handleDiscard}
                useImage={handleUse}
              />
            )}
          </Card>
        </TabPanel>
        <TabPanel aria-labelledby="credit-tab" hidden={id !== 'credit'} id="credit-panel">
          <Card padding={4}>
            {account?.errors ? (
              <Errors errors={account.errors} onClick={() => setAccount(undefined)} />
            ) : (
              <CreditBalance account={account} />
            )}
          </Card>
        </TabPanel>
      </Dialog>
    </ThemeProvider>
  )
}
