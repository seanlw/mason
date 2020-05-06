import * as React from 'react'
import {
  BcDamsMap,
} from '../../lib/map'
import { MetadataField } from './metadata-field'
import { IVocabularyMapRange } from '../../lib/vocabulary'

interface IMetadataViewProps {
  readonly objectTitle: string
  readonly metadata: any
  readonly map: ReadonlyArray<BcDamsMap> | null
  readonly vocabularyRanges: ReadonlyArray<IVocabularyMapRange>

  readonly onMetadataChange?: (metadata: any) => void
}

interface IMetadataViewState {
  readonly metadata: any
}

export class MetadataView extends React.Component<IMetadataViewProps, IMetadataViewState> {

  constructor(props: IMetadataViewProps) {
    super(props)

    this.state = {
      metadata: this.props.metadata
    }
  }

  public componentWillReceiveProps(nextProps: IMetadataViewProps) {
    this.setState({ metadata: nextProps.metadata })
  }

  public render() {
    return (
      <div className="metadata-view">
        {this.renderFields()}
      </div>
    )
  }

  public renderFields() {
    if (!this.props.map) {
      return null
    }

    return this.props.map.map((field: BcDamsMap, index) => {
      if (!field.visible) {
        return null
      }

      const identifier = `${field.namespace}.${field.name}`
      const value = this.state.metadata[identifier] || ''
      const range = this.props.vocabularyRanges.find(
        node => node.prefLabel.toLowerCase() === field.range[0].label.toLowerCase())
      const nodes = range ? range.nodes : []

      if (identifier === 'dcterms.title' && value === '') {
        this.state.metadata[identifier] = this.props.objectTitle
      }

      return (
        <MetadataField
          key={index}
          field={field}
          value={value}
          identifier={identifier}
          range={nodes}
          onValueChange={this.onValueChange}
        />
      )
    })
  }

  private onValueChange = (identifier: string, value: string) => {
    const metadata = this.state.metadata
    metadata[identifier] = value
    this.setState({ metadata: metadata })

    if (this.props.onMetadataChange) {
      this.props.onMetadataChange(metadata)
    }
  }
}

