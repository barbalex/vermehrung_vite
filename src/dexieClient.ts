import Dexie, { DexieTable } from 'dexie'
import { v1 as uuidv1 } from 'uuid'
import { DateTime } from 'luxon'
import gql from 'graphql-tag'
import md5 from 'blueimp-md5'

import toStringIfPossible from './utils/toStringIfPossible'
import personLabelFromPerson from './utils/personLabelFromPerson'
import gartenLabelFromGarten from './utils/gartenLabelFromGarten'
import eventLabelFromEvent from './utils/eventLabelFromEvent'
import artLabelFromAeArt from './utils/artLabelFromAeArt'
import lieferungLabelFromLieferung from './utils/lieferungLabelFromLieferung'
import teilkulturLabelFromTeilkultur from './utils/teilkulturLabelFromTeilkultur'
import kulturLabelFromKultur from './utils/kulturLabelFromKultur' // 1
import kulturLabelFromKulturUnderArt from './utils/kulturLabelFromKulturUnderArt'
import kulturLabelFromKulturUnderGarten from './utils/kulturLabelFromKulturUnderGarten'
import sammlungLabelFromSammlung from './utils/sammlungLabelFromSammlung'
import sammlungLabelFromSammlungUnderHerkunft from './utils/sammlungLabelFromSammlungUnderHerkunft'
import zaehlungLabelFromZaehlung from './utils/zaehlungLabelFromZaehlung'
import toPgArray from './utils/toPgArray'
import deleteAccount from './utils/deleteAccount'
import sammlungsSortedFromSammlungs from './utils/sammlungsSortedFromSammlungs'
// TODO: reinstate when file was copied
// import updateAllLieferungen from './components/Data/SammelLieferung/FormTitle/Copy/updateAllLieferungen' // 2
import {
  artFile as artFileFragment,
  gartenFile as gartenFileFragment,
  herkunftFile as herkunftFileFragment,
  kulturFile as kulturFileFragment,
  lieferungFile as lieferungFileFragment,
  personFile as personFileFragment,
  sammlungFile as sammlungFileFragment,
} from './utils/fragments'
import addIndexableBooleans from './utils/addIndexableBooleans'
import collectionFromTable from './utils/collectionFromTable'
import addTotalCriteriaToWhere from './utils/addTotalCriteriaToWhere'

window.Dexie = Dexie

export interface IHerkunft {
  id: string
  nr?: string
  lokalname?: string
  gemeinde?: string
  kanton?: string
  land?: string
  geom_point?: string
  wgs84_lat?: number
  wgs84_long?: number
  lv95_x?: number
  lv95_y?: number
  bemerkungen?: string
  changed?: Date
  changed_by?: string
  _rev?: string
  _parent_rev?: string
  _revisions?: string[]
  _depth?: number
  _deleted?: boolean
  _deleted_indexable?: number
  _conflicts?: string[]
}

export class Herkunft implements IHerkunft {
  id: string
  nr?: string
  lokalname?: string
  gemeinde?: string
  kanton?: string
  land?: string
  geom_point?: string
  wgs84_lat?: number
  wgs84_long?: number
  lv95_x?: number
  lv95_y?: number
  bemerkungen?: string
  changed?: Date
  changed_by?: string
  _rev?: string
  _parent_rev?: string
  _revisions?: string[]
  _depth?: number
  _deleted?: boolean
  _deleted_indexable?: number
  _conflicts?: string[]

  constructor(
    id?: string,
    nr?: string,
    lokalname?: string,
    gemeinde?: string,
    kanton?: string,
    land?: string,
    geom_point?: string,
    wgs84_lat?: number,
    wgs84_long?: number,
    lv95_x?: number,
    lv95_y?: number,
    bemerkungen?: string,
    changed?: Date,
    changed_by?: string,
    _rev?: string,
    _parent_rev?: string,
    _revisions?: string[],
    _depth?: number,
    _deleted?: boolean,
    _deleted_indexable?: number,
    _conflicts?: string[],
  ) {
    this.id = id ?? uuidv1()
    this.nr = nr ?? null
    this.lokalname = lokalname ?? null
    this.gemeinde = gemeinde ?? null
    this.kanton = kanton ?? null
    this.land = land ?? null
    this.geom_point = geom_point ?? null
    this.wgs84_lat = wgs84_lat ?? null
    this.wgs84_long = wgs84_long ?? null
    this.lv95_x = lv95_x ?? null
    this.lv95_y = lv95_y ?? null
    this.bemerkungen = bemerkungen ?? null
    this.changed = changed ?? new window.Date().toISOString()
    this.changed_by = changed_by ?? null
    this._rev = _rev ?? null
    this._parent_rev = _parent_rev ?? null
    this._revisions = _revisions ?? null
    this._depth = _depth ?? 1
    this._deleted = _deleted ?? false
    this._deleted_indexable = _deleted ? 1 : 0
    this._conflicts = _conflicts ?? null
  }

  label() {
    // only show lokalname if exist
    // does not exist if user does not have right to see it
    const gemeinde = this.gemeinde ?? 'keine Gemeinde'
    const lokalname = this.lokalname
    const nr = this.nr ?? 'keine Nr.'
    const label = [gemeinde, lokalname, nr].filter((e) => !!e).join('; ')

    return label
  }

  removeConflict(_rev: string) {
    this._conflicts = this._conflicts.filter((r) => r !== _rev)
  }

  async edit({ field, value, store }) {
    const { addQueuedQuery, user, unsetError } = store

    unsetError(`herkunft`)
    // first build the part that will be revisioned
    const newDepth = this._depth + 1
    const newObject = {
      herkunft_id: this.id,
      nr: field === 'nr' ? toStringIfPossible(value) : this.nr,
      lokalname:
        field === 'lokalname' ? toStringIfPossible(value) : this.lokalname,
      gemeinde:
        field === 'gemeinde' ? toStringIfPossible(value) : this.gemeinde,
      kanton: field === 'kanton' ? toStringIfPossible(value) : this.kanton,
      land: field === 'land' ? toStringIfPossible(value) : this.land,
      geom_point: field === 'geom_point' ? value : this.geom_point,
      bemerkungen:
        field === 'bemerkungen' ? toStringIfPossible(value) : this.bemerkungen,
      _parent_rev: this._rev,
      _depth: newDepth,
      _deleted: field === '_deleted' ? value : this._deleted,
    }
    const rev = `${newDepth}-${md5(JSON.stringify(newObject))}`
    // DO NOT include id in rev - or revs with same data will conflict
    newObject.id = uuidv1()
    newObject._rev = rev
    // do not revision the following fields as this leads to unwanted conflicts
    newObject.changed = new Date().toISOString()
    newObject.changed_by = user.email
    // convert to string as hasura does not support arrays yet
    // https://github.com/hasura/graphql-engine/pull/2243
    newObject._revisions = this._revisions
      ? toPgArray([rev, ...this._revisions])
      : toPgArray([rev])
    addQueuedQuery({
      name: 'mutateInsert_herkunft_rev_one',
      variables: JSON.stringify({
        object: newObject,
        on_conflict: {
          constraint: 'herkunft_rev_pkey',
          update_columns: ['id'],
        },
      }),
      revertTable: 'herkunft',
      revertId: this.id,
      revertField: field,
      revertValue: this[field],
      newValue: value,
    })
    // optimistically update store
    const storeUpdate = {
      [field]: value,
      _depth: newObject._depth,
      _rev: newObject._rev,
      _parent_rev: newObject._parent_rev,
      changed: newObject.changed,
      changed_by: newObject.changed_by,
      _revisions: this._revisions ? [rev, ...this._revisions] : [rev],
    }
    // set all indexable boolean fields
    addIndexableBooleans({ table: 'herkunft', object: storeUpdate })
    dexie.herkunfts.update(this.id, storeUpdate)
  }

  delete({ store }) {
    this.edit({ field: '_deleted', value: true, store })
  }
}

export interface ISammlung {
  id: string
  art_id?: string
  person_id?: string
  herkunft_id?: string
  nr?: string
  datum?: Date
  von_anzahl_individuen?: number
  anzahl_pflanzen?: number
  gramm_samen?: number
  andere_menge?: string
  geom_point?: string
  wgs84_lat?: number
  wgs84_long?: number
  lv95_x?: number
  lv95_y?: number
  geplant?: boolean
  geplant_indexable?: number
  bemerkungen?: string
  changed?: Date
  changed_by?: string
  _rev?: string
  _parent_rev?: string
  _revisions?: string[]
  _depth?: number
  _deleted?: boolean
  _deleted_indexable?: number
  _conflicts?: string[]
}

export class Sammlung implements ISammlung {
  id: string
  art_id?: string
  person_id?: string
  herkunft_id?: string
  nr?: string
  datum?: Date
  von_anzahl_individuen?: number
  anzahl_pflanzen?: number
  gramm_samen?: number
  andere_menge?: string
  geom_point?: string
  wgs84_lat?: number
  wgs84_long?: number
  lv95_x?: number
  lv95_y?: number
  geplant?: boolean
  geplant_indexable?: number
  bemerkungen?: string
  changed?: Date
  changed_by?: string
  _rev?: string
  _parent_rev?: string
  _revisions?: string[]
  _depth?: number
  _deleted?: boolean
  _deleted_indexable?: number
  _conflicts?: string[]

  constructor(
    id: string,
    art_id?: string,
    person_id?: string,
    herkunft_id?: string,
    nr?: string,
    datum?: Date,
    von_anzahl_individuen?: number,
    anzahl_pflanzen?: number,
    gramm_samen?: number,
    andere_menge?: string,
    geom_point?: string,
    wgs84_lat?: number,
    wgs84_long?: number,
    lv95_x?: number,
    lv95_y?: number,
    geplant?: boolean,
    geplant_indexable?: number,
    bemerkungen?: string,
    changed?: Date,
    changed_by?: string,
    _rev?: string,
    _parent_rev?: string,
    _revisions?: string[],
    _depth?: number,
    _deleted?: boolean,
    _deleted_indexable?: number,
    _conflicts?: string[],
  ) {
    this.id = id ?? uuidv1()
    this.art_id = art_id ?? null
    this.person_id = person_id ?? null
    this.herkunft_id = herkunft_id ?? null
    this.nr = nr ?? null
    this.datum = datum ?? null
    this.von_anzahl_individuen = von_anzahl_individuen ?? null
    this.anzahl_pflanzen = anzahl_pflanzen ?? null
    this.gramm_samen = gramm_samen ?? null
    this.andere_menge = andere_menge ?? null
    this.geom_point = geom_point ?? null
    this.wgs84_lat = wgs84_lat ?? null
    this.wgs84_long = wgs84_long ?? null
    this.lv95_x = lv95_x ?? null
    this.lv95_y = lv95_y ?? null
    this.geplant = geplant ?? false
    this.geplant_indexable = geplant ? 1 : 0
    this.bemerkungen = bemerkungen ?? null
    this.changed = changed ?? new window.Date().toISOString()
    this.changed_by = changed_by ?? null
    this._rev = _rev ?? null
    this._parent_rev = _parent_rev ?? null
    this._revisions = _revisions ?? null
    this._depth = _depth ?? 1
    this._deleted = _deleted ?? false
    this._deleted_indexable = _deleted ? 1 : 0
    this._conflicts = _conflicts ?? null
  }

  async art() {
    return await dexie.arts.get(
      this.art_id ?? '99999999-9999-9999-9999-999999999999',
    )
  }

  async herkunft() {
    return await dexie.herkunfts.get(
      this.herkunft_id ?? '99999999-9999-9999-9999-999999999999',
    )
  }

  async person() {
    return await dexie.persons.get(
      this.person_id ?? '99999999-9999-9999-9999-999999999999',
    )
  }

  async label() {
    const herkunft = await dexie.herkunfts.get(
      this.herkunft_id ?? '99999999-9999-9999-9999-999999999999',
    )
    const art = await dexie.arts.get(
      this.art_id ?? '99999999-9999-9999-9999-999999999999',
    )
    const ae_art = await dexie.ae_arts.get(
      art?.ae_id ?? '99999999-9999-9999-9999-999999999999',
    )
    const person = await dexie.persons.get(
      this.person_id ?? '99999999-9999-9999-9999-999999999999',
    )

    return sammlungLabelFromSammlung({
      sammlung: this,
      art,
      ae_art,
      person,
      herkunft,
    })
  }

  async labelUnderHerkunft() {
    const art = await dexie.arts.get(
      this.art_id ?? '99999999-9999-9999-9999-999999999999',
    )
    const ae_art = await dexie.ae_arts.get(
      art?.ae_id ?? '99999999-9999-9999-9999-999999999999',
    )
    const person = await dexie.persons.get(
      this.person_id ?? '99999999-9999-9999-9999-999999999999',
    )

    return sammlungLabelFromSammlungUnderHerkunft({
      sammlung: this,
      art,
      ae_art,
      person,
    })
  }

  removeConflict(_rev: string) {
    this._conflicts = this._conflicts.filter((r) => r !== _rev)
  }

  async edit({ field, value, store }) {
    const { addQueuedQuery, user, unsetError } = store

    unsetError(`sammlung`)
    // first build the part that will be revisioned
    const newDepth = this._depth + 1
    const newObject = {
      sammlung_id: this.id,
      art_id: field === 'art_id' ? value : this.art_id,
      person_id: field === 'person_id' ? value : this.person_id,
      herkunft_id: field === 'herkunft_id' ? value : this.herkunft_id,
      nr: field === 'nr' ? toStringIfPossible(value) : this.nr,
      geom_point: field === 'geom_point' ? value : this.geom_point,
      datum: field === 'datum' ? value : this.datum,
      von_anzahl_individuen:
        field === 'von_anzahl_individuen' ? value : this.von_anzahl_individuen,
      anzahl_pflanzen:
        field === 'anzahl_pflanzen' ? value : this.anzahl_pflanzen,
      gramm_samen: field === 'gramm_samen' ? value : this.gramm_samen,
      andere_menge:
        field === 'andere_menge'
          ? toStringIfPossible(value)
          : this.andere_menge,
      geplant: field === 'geplant' ? value : this.geplant,
      bemerkungen:
        field === 'bemerkungen' ? toStringIfPossible(value) : this.bemerkungen,
      _parent_rev: this._rev,
      _depth: newDepth,
      _deleted: field === '_deleted' ? value : this._deleted,
    }
    const rev = `${newDepth}-${md5(JSON.stringify(newObject))}`
    // DO NOT include id in rev - or revs with same data will conflict
    newObject.id = uuidv1()
    newObject._rev = rev
    // do not revision the following fields as this leads to unwanted conflicts
    newObject.changed = new window.Date().toISOString()
    newObject.changed_by = user.email
    // convert to string as hasura does not support arrays yet
    // https://github.com/hasura/graphql-engine/pull/2243
    newObject._revisions = this._revisions
      ? toPgArray([rev, ...this._revisions])
      : toPgArray([rev])
    addQueuedQuery({
      name: 'mutateInsert_sammlung_rev_one',
      variables: JSON.stringify({
        object: newObject,
        on_conflict: {
          constraint: 'sammlung_rev_pkey',
          update_columns: ['id'],
        },
      }),
      revertTable: 'sammlung',
      revertId: this.id,
      revertField: field,
      revertValue: this[field],
      newValue: value,
    })

    // optimistically update store
    const storeUpdate = {
      [field]: value,
      _depth: newObject._depth,
      _rev: newObject._rev,
      _parent_rev: newObject._parent_rev,
      changed: newObject.changed,
      changed_by: newObject.changed_by,
      _revisions: this._revisions ? [rev, ...this._revisions] : [rev],
    }
    // set all indexable boolean fields
    addIndexableBooleans({ table: 'sammlung', object: storeUpdate })

    dexie.sammlungs.update(this.id, storeUpdate)
  }

  delete({ store }) {
    this.edit({ field: '_deleted', value: true, store })
  }
}

export interface ILieferung {
  id: string
  sammel_lieferung_id?: string
  art_id?: string
  person_id?: string
  von_sammlung_id?: string
  von_kultur_id?: string
  datum?: Date
  nach_kultur_id?: string
  nach_ausgepflanzt?: boolean
  nach_ausgepflanzt_indexable?: number
  von_anzahl_individuen?: number
  anzahl_pflanzen?: number
  anzahl_auspflanzbereit?: number
  gramm_samen?: number
  andere_menge?: string
  geplant?: boolean
  geplant_indexable?: number
  bemerkungen?: string
  changed?: Date
  changed_by?: string
  _rev?: string
  _parent_rev?: string
  _revisions?: string[]
  _depth?: number
  _deleted?: boolean
  _deleted_indexable?: number
  _conflicts?: string[]
}

export class Lieferung {
  id: string
  sammel_lieferung_id?: string
  art_id?: string
  person_id?: string
  von_sammlung_id?: string
  von_kultur_id?: string
  datum?: Date
  nach_kultur_id?: string
  nach_ausgepflanzt?: boolean
  nach_ausgepflanzt_indexable?: number
  von_anzahl_individuen?: number
  anzahl_pflanzen?: number
  anzahl_auspflanzbereit?: number
  gramm_samen?: number
  andere_menge?: string
  geplant?: boolean
  geplant_indexable?: number
  bemerkungen?: string
  changed?: Date
  changed_by?: string
  _rev?: string
  _parent_rev?: string
  _revisions?: string[]
  _depth?: number
  _deleted?: boolean
  _deleted_indexable?: number
  _conflicts?: string[]

  constructor(
    id: string,
    sammel_lieferung_id?: string,
    art_id?: string,
    person_id?: string,
    von_sammlung_id?: string,
    von_kultur_id?: string,
    datum?: Date,
    nach_kultur_id?: string,
    nach_ausgepflanzt?: boolean,
    nach_ausgepflanzt_indexable?: number,
    von_anzahl_individuen?: number,
    anzahl_pflanzen?: number,
    anzahl_auspflanzbereit?: number,
    gramm_samen?: number,
    andere_menge?: string,
    geplant?: boolean,
    geplant_indexable?: number,
    bemerkungen?: string,
    changed?: Date,
    changed_by?: string,
    _rev?: string,
    _parent_rev?: string,
    _revisions?: string[],
    _depth?: number,
    _deleted?: boolean,
    _deleted_indexable?: number,
    _conflicts?: string[],
  ) {
    this.id = id ?? uuidv1()
    this.sammel_lieferung_id = sammel_lieferung_id ?? null
    this.art_id = art_id ?? null
    this.person_id = person_id ?? null
    this.von_sammlung_id = von_sammlung_id ?? null
    this.von_kultur_id = von_kultur_id ?? null
    this.datum = datum ?? null
    this.nach_kultur_id = nach_kultur_id ?? null
    this.nach_ausgepflanzt = nach_ausgepflanzt ?? false
    this.nach_ausgepflanzt_indexable = nach_ausgepflanzt ? 1 : 0
    this.von_anzahl_individuen = von_anzahl_individuen ?? null
    this.anzahl_pflanzen = anzahl_pflanzen ?? null
    this.anzahl_auspflanzbereit = anzahl_auspflanzbereit ?? null
    this.gramm_samen = gramm_samen ?? null
    this.andere_menge = andere_menge ?? null
    this.geplant = geplant ?? false
    this.geplant_indexable = geplant ? 1 : 0
    this.bemerkungen = bemerkungen ?? null
    this.changed = changed ?? new window.Date().toISOString()
    this.changed_by = changed_by ?? null
    this._rev = _rev ?? null
    this._parent_rev = _parent_rev ?? null
    this._revisions = _revisions ?? null
    this._depth = _depth ?? 1
    this._deleted = _deleted ?? false
    this._deleted_indexable = _deleted ? 1 : 0
    this._conflicts = _conflicts ?? null
  }

  async art() {
    return await dexie.arts.get(
      this.art_id ?? '99999999-9999-9999-9999-999999999999',
    )
  }

  async vonKultur() {
    return await dexie.kulturs.get(
      this.von_kultur_id ?? '99999999-9999-9999-9999-999999999999',
    )
  }

  async nachKultur() {
    return await dexie.kulturs.get(
      this.nach_kultur_id ?? '99999999-9999-9999-9999-999999999999',
    )
  }

  async sammlung() {
    return await dexie.sammlungs.get(
      this.von_sammlung_id ?? '99999999-9999-9999-9999-999999999999',
    )
  }

  async person() {
    return await dexie.persons.get(
      this.person_id ?? '99999999-9999-9999-9999-999999999999',
    )
  }

  async sammelLieferung() {
    return await dexie.sammel_lieferungs.get(
      this.sammel_lieferung_id ?? '99999999-9999-9999-9999-999999999999',
    )
  }

  label() {
    return lieferungLabelFromLieferung({ lieferung: this })
  }

  removeConflict(_rev: string) {
    this._conflicts = this._conflicts.filter((r) => r !== _rev)
  }

  async edit({ field, value, store }) {
    const { addQueuedQuery, user, unsetError } = store

    unsetError(`lieferung`)
    // first build the part that will be revisioned
    const newDepth = this._depth + 1
    const newObject = {
      lieferung_id: this.id,
      sammel_lieferung_id:
        field === 'sammel_lieferung_id' ? value : this.sammel_lieferung_id,
      art_id: field === 'art_id' ? value : this.art_id,
      person_id: field === 'person_id' ? value : this.person_id,
      von_sammlung_id:
        field === 'von_sammlung_id' ? value : this.von_sammlung_id,
      von_kultur_id: field === 'von_kultur_id' ? value : this.von_kultur_id,
      datum: field === 'datum' ? value : this.datum,
      nach_kultur_id: field === 'nach_kultur_id' ? value : this.nach_kultur_id,
      nach_ausgepflanzt:
        field === 'nach_ausgepflanzt' ? value : this.nach_ausgepflanzt,
      von_anzahl_individuen:
        field === 'von_anzahl_individuen' ? value : this.von_anzahl_individuen,
      anzahl_pflanzen:
        field === 'anzahl_pflanzen' ? value : this.anzahl_pflanzen,
      anzahl_auspflanzbereit:
        field === 'anzahl_auspflanzbereit'
          ? value
          : this.anzahl_auspflanzbereit,
      gramm_samen: field === 'gramm_samen' ? value : this.gramm_samen,
      andere_menge:
        field === 'andere_menge'
          ? toStringIfPossible(value)
          : this.andere_menge,
      geplant: field === 'geplant' ? value : this.geplant,
      bemerkungen:
        field === 'bemerkungen' ? toStringIfPossible(value) : this.bemerkungen,
      _parent_rev: this._rev,
      _depth: newDepth,
      _deleted: field === '_deleted' ? value : this._deleted,
    }
    const rev = `${newDepth}-${md5(JSON.stringify(newObject))}`
    // DO NOT include id in rev - or revs with same data will conflict
    newObject.id = uuidv1()
    newObject._rev = rev
    // do not revision the following fields as this leads to unwanted conflicts
    newObject.changed = new window.Date().toISOString()
    newObject.changed_by = user.email
    // convert to string as hasura does not support arrays yet
    // https://github.com/hasura/graphql-engine/pull/2243
    newObject._revisions = this._revisions
      ? toPgArray([rev, ...this._revisions])
      : toPgArray([rev])
    addQueuedQuery({
      name: 'mutateInsert_lieferung_rev_one',
      variables: JSON.stringify({
        object: newObject,
        on_conflict: {
          constraint: 'lieferung_rev_pkey',
          update_columns: ['id'],
        },
      }),
      revertTable: 'lieferung',
      revertId: this.id,
      revertField: field,
      revertValue: this[field],
      newValue: value,
    })
    // optimistically update store
    const storeUpdate = {
      [field]: value,
      _depth: newObject._depth,
      _rev: newObject._rev,
      _parent_rev: newObject._parent_rev,
      changed: newObject.changed,
      changed_by: newObject.changed_by,
      _revisions: this._revisions ? [rev, ...this._revisions] : [rev],
    }
    // set all indexable boolean fields
    addIndexableBooleans({ table: 'lieferung', object: storeUpdate })

    dexie.lieferungs.update(this.id, storeUpdate)
  }

  delete({ store }) {
    this.edit({ field: '_deleted', value: true, store })
  }
}

export interface IArt {
  id: string
  ae_id?: string
  changed?: Date
  changed_by?: string
  _rev?: string
  _parent_rev?: string
  _revisions?: string[]
  _depth?: number
  _deleted?: boolean
  _deleted_indexable?: number
  _conflicts?: string[]
}

export class Art implements IArt {
  id: string
  ae_id?: string
  changed?: Date
  changed_by?: string
  _rev?: string
  _parent_rev?: string
  _revisions?: string[]
  _depth?: number
  _deleted?: boolean
  _deleted_indexable?: number
  _conflicts?: string[]

  constructor(
    id: string,
    ae_id?: string,
    changed?: Date,
    changed_by?: string,
    _rev?: string,
    _parent_rev?: string,
    _revisions?: string[],
    _depth?: number,
    _deleted?: boolean,
    _deleted_indexable?: number,
    _conflicts?: string[],
  ) {
    this.id = id ?? uuidv1()
    this.ae_id = ae_id ?? null
    this.changed = changed ?? new window.Date().toISOString()
    this.changed_by = changed_by ?? null
    this._rev = _rev ?? null
    this._parent_rev = _parent_rev ?? null
    this._revisions = _revisions ?? null
    this._depth = _depth ?? 1
    this._deleted = _deleted ?? false
    this._deleted_indexable = _deleted ? 1 : 0
    this._conflicts = _conflicts ?? null
  }

  async aeArt() {
    return await dexie.ae_arts.get(
      this.ae_id ?? '99999999-9999-9999-9999-999999999999',
    )
  }

  async sammlungs({ store }) {
    const sammlungs = await collectionFromTable({
      table: 'sammlung',
      where: addTotalCriteriaToWhere({
        store,
        table: 'sammlung',
        where: { art_id: this.id },
      }),
    }).toArray()

    return await sammlungsSortedFromSammlungs(sammlungs)
  }

  async label() {
    const ae_art = await dexie.ae_arts.get(
      this.ae_id ?? '99999999-9999-9999-9999-999999999999',
    )

    return artLabelFromAeArt({ ae_art })
  }

  async herkunfts({ store }) {
    const sammlungs = await collectionFromTable({
      table: 'sammlung',
      where: addTotalCriteriaToWhere({
        store,
        table: 'sammlung',
        where: { art_id: this.id },
      }),
    })
    const herkunftIds = sammlungs
      .filter((s) => !!s.herkunft_id)
      .map((s) => s.herkunft_id)

    return await dexie.herkunfts.bulkGet(herkunftIds)
  }

  removeConflict(_rev: string) {
    this._conflicts = this._conflicts.filter((r) => r !== _rev)
  }

  async edit({ field, value, store }) {
    const { addQueuedQuery, user, unsetError } = store

    unsetError(`art`)
    // first build the part that will be revisioned
    const newDepth = this._depth + 1
    const newObject = {
      art_id: this.id,
      ae_id: field === 'ae_id' ? value : this.ae_id,
      _parent_rev: this._rev,
      _depth: newDepth,
      _deleted: field === '_deleted' ? value : this._deleted,
    }
    const rev = `${newDepth}-${md5(JSON.stringify(newObject))}`
    // DO NOT include id in rev - or revs with same data will conflict
    newObject.id = uuidv1()
    newObject._rev = rev
    // do not revision the following fields as this leads to unwanted conflicts
    newObject.changed = new window.Date().toISOString()
    newObject.changed_by = user.email
    // convert to string as hasura does not support arrays yet
    // https://github.com/hasura/graphql-engine/pull/2243
    newObject._revisions = this._revisions
      ? toPgArray([rev, ...this._revisions])
      : toPgArray([rev])
    addQueuedQuery({
      name: 'mutateInsert_art_rev_one',
      variables: JSON.stringify({
        object: newObject,
        on_conflict: {
          constraint: 'art_rev_pkey',
          update_columns: ['id'],
        },
      }),
      revertTable: 'art',
      revertId: this.id,
      revertField: field,
      revertValue: this[field],
      newValue: value,
    })
    // optimistically update store
    const storeUpdate = {
      [field]: value,
      _depth: newObject._depth,
      _rev: newObject._rev,
      _parent_rev: newObject._parent_rev,
      changed: newObject.changed,
      changed_by: newObject.changed_by,
      _revisions: this._revisions ? [rev, ...this._revisions] : [rev],
    }
    // set all indexable boolean fields
    addIndexableBooleans({ table: 'art', object: storeUpdate })

    dexie.arts.update(this.id, storeUpdate)
  }

  delete({ store }) {
    this.edit({ field: '_deleted', value: true, store })
  }
}

export interface IAeArt {
  id: string
  name?: string
  changed?: Date
}

export class AeArt implements IAeArt {
  id: string
  name?: string
  changed?: Date
}

export interface IGarten {
  id: string
  name?: string
  person_id?: string
  strasse?: string
  plz?: number
  ort?: string
  geom_point?: string
  wgs84_lat?: string
  wgs84_long?: string
  lv95_x?: string
  lv95_y?: string
  aktiv?: boolean
  aktiv_indexable?: number
  bemerkungen?: string
  changed?: Date
  changed_by?: string
  _rev?: string
  _parent_rev?: string
  _revisions?: string[]
  _depth?: number
  _deleted?: boolean
  _deleted_indexable?: number
  _conflicts?: string[]
}

export class Garten implements IGarten {
  id: string
  name?: string
  person_id?: string
  strasse?: string
  plz?: number
  ort?: string
  geom_point?: string
  wgs84_lat?: string
  wgs84_long?: string
  lv95_x?: string
  lv95_y?: string
  aktiv?: boolean
  aktiv_indexable?: number
  bemerkungen?: string
  changed?: Date
  changed_by?: string
  _rev?: string
  _parent_rev?: string
  _revisions?: string[]
  _depth?: number
  _deleted?: boolean
  _deleted_indexable?: number
  _conflicts?: string[]

  constructor(
    id: string,
    name?: string,
    person_id?: string,
    strasse?: string,
    plz?: number,
    ort?: string,
    geom_point?: string,
    wgs84_lat?: string,
    wgs84_long?: string,
    lv95_x?: string,
    lv95_y?: string,
    aktiv?: boolean,
    aktiv_indexable?: number,
    bemerkungen?: string,
    changed?: Date,
    changed_by?: string,
    _rev?: string,
    _parent_rev?: string,
    _revisions?: string[],
    _depth?: number,
    _deleted?: boolean,
    _deleted_indexable?: number,
    _conflicts?: string[],
  ) {
    this.id = id ?? uuidv1()
    this.name = name ?? null
    this.person_id = person_id ?? null
    this.strasse = strasse ?? null
    this.plz = plz ?? null
    this.ort = ort ?? null
    this.geom_point = geom_point ?? null
    this.wgs84_lat = wgs84_lat ?? null
    this.wgs84_long = wgs84_long ?? null
    this.lv95_x = lv95_x ?? null
    this.lv95_y = lv95_y ?? null
    this.aktiv = aktiv ?? true
    this.aktiv_indexable = aktiv === false ? 0 : 1
    this.bemerkungen = bemerkungen ?? null
    this.changed = changed ?? new window.Date().toISOString()
    this.changed_by = changed_by ?? null
    this._rev = _rev ?? null
    this._parent_rev = _parent_rev ?? null
    this._revisions = _revisions ?? null
    this._depth = _depth ?? 1
    this._deleted = _deleted ?? false
    this._deleted_indexable = _deleted ? 1 : 0
    this._conflicts = _conflicts ?? null
  }

  async person() {
    return await dexie.persons.get(
      this.person_id ?? '99999999-9999-9999-9999-999999999999',
    )
  }

  async kulturs({ store }) {
    return await collectionFromTable({
      table: 'kultur',
      where: addTotalCriteriaToWhere({
        store,
        table: 'kultur',
        where: { garten_id: this.id },
      }),
    }).toArray()
  }

  async label() {
    const person = await dexie.persons.get(
      this.person_id ?? '99999999-9999-9999-9999-999999999999',
    )

    return gartenLabelFromGarten({
      garten: this,
      person,
    })
  }

  removeConflict(_rev: string) {
    this._conflicts = this._conflicts.filter((r) => r !== _rev)
  }

  async edit({ field, value, store }) {
    const { addQueuedQuery, user, unsetError } = store

    unsetError(`garten`)
    // first build the part that will be revisioned
    const newDepth = this._depth + 1
    const newObject = {
      garten_id: this.id,
      name: field === 'name' ? toStringIfPossible(value) : this.name,
      person_id: field === 'person_id' ? value : this.person_id,
      strasse: field === 'strasse' ? toStringIfPossible(value) : this.strasse,
      plz: field === 'plz' ? value : this.plz,
      ort: field === 'ort' ? toStringIfPossible(value) : this.ort,
      geom_point: field === 'geom_point' ? value : this.geom_point,
      aktiv: field === 'aktiv' ? value : this.aktiv,
      bemerkungen:
        field === 'bemerkungen' ? toStringIfPossible(value) : this.bemerkungen,
      _parent_rev: this._rev,
      _depth: newDepth,
      _deleted: field === '_deleted' ? value : this._deleted,
    }
    const rev = `${newDepth}-${md5(JSON.stringify(newObject))}`
    // DO NOT include id in rev - or revs with same data will conflict
    newObject.id = uuidv1()
    newObject._rev = rev
    // do not revision the following fields as this leads to unwanted conflicts
    newObject.changed = new window.Date().toISOString()
    newObject.changed_by = user.email
    // convert to string as hasura does not support arrays yet
    // https://github.com/hasura/graphql-engine/pull/2243
    newObject._revisions = this._revisions
      ? toPgArray([rev, ...this._revisions])
      : toPgArray([rev])
    addQueuedQuery({
      name: 'mutateInsert_garten_rev_one',
      variables: JSON.stringify({
        object: newObject,
        on_conflict: {
          constraint: 'garten_rev_pkey',
          update_columns: ['id'],
        },
      }),
      revertTable: 'garten',
      revertId: this.id,
      revertField: field,
      revertValue: this[field],
      newValue: value,
    })
    // optimistically update store
    const storeUpdate = {
      [field]: value,
      _depth: newObject._depth,
      _rev: newObject._rev,
      _parent_rev: newObject._parent_rev,
      changed: newObject.changed,
      changed_by: newObject.changed_by,
      _revisions: this._revisions ? [rev, ...this._revisions] : [rev],
    }
    // set all indexable boolean fields
    addIndexableBooleans({ table: 'garten', object: storeUpdate })

    dexie.gartens.update(this.id, storeUpdate)
  }

  delete({ store }) {
    this.edit({ field: '_deleted', value: true, store })
  }
}

export interface IKultur {
  id: string
  art_id?: string
  herkunft_id?: string
  garten_id?: string
  zwischenlager?: boolean
  zwischenlager_indexable?: number
  erhaltungskultur?: boolean
  erhaltungskultur_indexable?: number
  von_anzahl_individuen?: number
  bemerkungen?: string
  aktiv?: boolean
  aktiv_indexable?: number
  changed?: Date
  changed_by?: string
  _rev?: string
  _parent_rev?: string
  _revisions?: string[]
  _depth?: number
  _deleted?: boolean
  _deleted_indexable?: number
  _conflicts?: string[]
}

export class Kultur implements IKultur {
  id: string
  art_id?: string
  herkunft_id?: string
  garten_id?: string
  zwischenlager?: boolean
  zwischenlager_indexable?: number
  erhaltungskultur?: boolean
  erhaltungskultur_indexable?: number
  von_anzahl_individuen?: number
  bemerkungen?: string
  aktiv?: boolean
  aktiv_indexable?: number
  changed?: Date
  changed_by?: string
  _rev?: string
  _parent_rev?: string
  _revisions?: string[]
  _depth?: number
  _deleted?: boolean
  _deleted_indexable?: number
  _conflicts?: string[]

  constructor(
    id: string,
    art_id?: string,
    herkunft_id?: string,
    garten_id?: string,
    zwischenlager?: boolean,
    zwischenlager_indexable?: number,
    erhaltungskultur?: boolean,
    erhaltungskultur_indexable?: number,
    von_anzahl_individuen?: number,
    bemerkungen?: string,
    aktiv?: boolean,
    aktiv_indexable?: number,
    changed?: Date,
    changed_by?: string,
    _rev?: string,
    _parent_rev?: string,
    _revisions?: string[],
    _depth?: number,
    _deleted?: boolean,
    _deleted_indexable?: number,
    _conflicts?: string[],
  ) {
    this.id = id ?? uuidv1()
    this.art_id = art_id ?? null
    this.herkunft_id = herkunft_id ?? null
    this.garten_id = garten_id ?? null
    this.zwischenlager = zwischenlager ?? false
    this.zwischenlager_indexable = zwischenlager ? 1 : 0
    this.erhaltungskultur = erhaltungskultur ?? false
    this.erhaltungskultur_indexable = erhaltungskultur ? 1 : 0
    this.von_anzahl_individuen = von_anzahl_individuen ?? null
    this.bemerkungen = bemerkungen ?? null
    this.aktiv = aktiv ?? true
    this.aktiv_indexable = aktiv === false ? 0 : 1
    this.changed = changed ?? new window.Date().toISOString()
    this.changed_by = changed_by ?? null
    this._rev = _rev ?? null
    this._parent_rev = _parent_rev ?? null
    this._revisions = _revisions ?? null
    this._depth = _depth ?? 1
    this._deleted = _deleted ?? false
    this._deleted_indexable = _deleted ? 1 : 0
    this._conflicts = _conflicts ?? null
  }

  async anlieferungs({ store }) {
    return await collectionFromTable({
      table: 'lieferung',
      where: addTotalCriteriaToWhere({
        store,
        table: 'lieferung',
        where: { nach_kultur_id: this.id },
      }),
    })
  }
  async auslieferungs({ store }) {
    return await collectionFromTable({
      table: 'lieferung',
      where: addTotalCriteriaToWhere({
        store,
        table: 'lieferung',
        where: { von_kultur_id: this.id },
      }),
    }).toArray()
  }

  async art() {
    return await dexie.arts.get(
      this.art_id ?? '99999999-9999-9999-9999-999999999999',
    )
  }

  async garten() {
    return await dexie.gartens.get(
      this.garten_id ?? '99999999-9999-9999-9999-999999999999',
    )
  }

  async gartenPerson() {
    const garten = await this.garten()
    return await dexie.persons.get(
      garten?.person_id ?? '99999999-9999-9999-9999-999999999999',
    )
  }

  async aeArt() {
    const art = await this.art()
    return await dexie.ae_arts.get(
      art?.ae_id ?? '99999999-9999-9999-9999-999999999999',
    )
  }

  async herkunft() {
    return await dexie.herkunfts.get(
      this.herkunft_id ?? '99999999-9999-9999-9999-999999999999',
    )
  }

  async kulturOption() {
    return await dexie.kultur_options.get(this.id)
  }

  async label() {
    const garten = await dexie.gartens.get(
      this.garten_id ?? '99999999-9999-9999-9999-999999999999',
    )
    const gartenPerson = await dexie.persons.get(
      garten?.person_id ?? '99999999-9999-9999-9999-999999999999',
    )
    const art = await dexie.arts.get(
      this.art_id ?? '99999999-9999-9999-9999-999999999999',
    )
    const aeArt = await dexie.ae_arts.get(
      art?.ae_id ?? '99999999-9999-9999-9999-999999999999',
    )
    const herkunft = await dexie.herkunfts.get(
      this.herkunft_id ?? '99999999-9999-9999-9999-999999999999',
    )

    return kulturLabelFromKultur({
      kultur: this,
      garten,
      gartenPerson,
      art,
      aeArt,
      herkunft,
    })
  }

  async labelUnderArt() {
    const garten = await dexie.gartens.get(
      this.garten_id ?? '99999999-9999-9999-9999-999999999999',
    )
    const gartenPerson = await dexie.persons.get(
      garten?.person_id ?? '99999999-9999-9999-9999-999999999999',
    )
    const herkunft = await dexie.herkunfts.get(
      this.herkunft_id ?? '99999999-9999-9999-9999-999999999999',
    )

    return kulturLabelFromKulturUnderArt({
      kultur: this,
      garten,
      gartenPerson,
      herkunft,
    })
  }

  async labelUnderGarten() {
    const art = await dexie.arts.get(
      this.art_id ?? '99999999-9999-9999-9999-999999999999',
    )
    const aeArt = await dexie.ae_arts.get(
      art?.ae_id ?? '99999999-9999-9999-9999-999999999999',
    )
    const herkunft = await dexie.herkunfts.get(
      this.herkunft_id ?? '99999999-9999-9999-9999-999999999999',
    )

    return kulturLabelFromKulturUnderGarten({
      kultur: this,
      art,
      aeArt,
      herkunft,
    })
  }

  removeConflict(_rev: string) {
    this._conflicts = this._conflicts.filter((r) => r !== _rev)
  }
  async edit({ field, value, store }) {
    const { addQueuedQuery, user, unsetError } = store

    unsetError(`kultur`)
    // first build the part that will be revisioned
    const newDepth = this._depth + 1
    const newObject = {
      kultur_id: this.id,
      art_id: field === 'art_id' ? value : this.art_id,
      herkunft_id: field === 'herkunft_id' ? value : this.herkunft_id,
      garten_id: field === 'garten_id' ? value : this.garten_id,
      zwischenlager: field === 'zwischenlager' ? value : this.zwischenlager,
      erhaltungskultur:
        field === 'erhaltungskultur' ? value : this.erhaltungskultur,
      von_anzahl_individuen:
        field === 'von_anzahl_individuen' ? value : this.von_anzahl_individuen,
      bemerkungen:
        field === 'bemerkungen' ? toStringIfPossible(value) : this.bemerkungen,
      aktiv: field === 'aktiv' ? value : this.aktiv,
      _parent_rev: this._rev,
      _depth: newDepth,
      _deleted: field === '_deleted' ? value : this._deleted,
    }
    const rev = `${newDepth}-${md5(JSON.stringify(newObject))}`
    // DO NOT include id in rev - or revs with same data will conflict
    newObject.id = uuidv1()
    newObject._rev = rev
    // do not revision the following fields as this leads to unwanted conflicts
    newObject.changed = new window.Date().toISOString()
    newObject.changed_by = user.email
    // convert to string as hasura does not support arrays yet
    // https://github.com/hasura/graphql-engine/pull/2243
    newObject._revisions = this._revisions
      ? toPgArray([rev, ...this._revisions])
      : toPgArray([rev])
    addQueuedQuery({
      name: 'mutateInsert_kultur_rev_one',
      variables: JSON.stringify({
        object: newObject,
        on_conflict: {
          constraint: 'kultur_rev_pkey',
          update_columns: ['id'],
        },
      }),
      revertTable: 'kultur',
      revertId: this.id,
      revertField: field,
      revertValue: this[field],
      newValue: value,
    })
    // optimistically update store
    const storeUpdate = {
      [field]: value,
      _depth: newObject._depth,
      _rev: newObject._rev,
      _parent_rev: newObject._parent_rev,
      changed: newObject.changed,
      changed_by: newObject.changed_by,
      _revisions: this._revisions ? [rev, ...this._revisions] : [rev],
    }
    // set all indexable boolean fields
    addIndexableBooleans({ table: 'kultur', object: storeUpdate })

    dexie.kulturs.update(this.id, storeUpdate)
  }

  delete({ store }) {
    this.edit({ field: '_deleted', value: true, store })
  }
}

export interface ITeilkultur {
  id: string
  kultur_id?: string
  name?: string
  ort1?: string
  ort2?: string
  ort3?: string
  bemerkungen?: string
  changed?: Date
  changed_by?: string
  _rev?: string
  _parent_rev?: string
  _revisions?: string[]
  _depth?: number
  _deleted?: boolean
  _deleted_indexable?: number
  _conflicts?: string[]
}

export class Teilkultur implements ITeilkultur {
  id: string
  kultur_id?: string
  name?: string
  ort1?: string
  ort2?: string
  ort3?: string
  bemerkungen?: string
  changed?: Date
  changed_by?: string
  _rev?: string
  _parent_rev?: string
  _revisions?: string[]
  _depth?: number
  _deleted?: boolean
  _deleted_indexable?: number
  _conflicts?: string[]

  constructor(
    id: string,
    kultur_id?: string,
    name?: string,
    ort1?: string,
    ort2?: string,
    ort3?: string,
    bemerkungen?: string,
    changed?: Date,
    changed_by?: string,
    _rev?: string,
    _parent_rev?: string,
    _revisions?: string[],
    _depth?: number,
    _deleted?: boolean,
    _deleted_indexable?: number,
    _conflicts?: string[],
  ) {
    this.id = id ?? uuidv1()
    this.kultur_id = kultur_id ?? null
    this.name = name ?? null
    this.ort1 = ort1 ?? null
    this.ort2 = ort2 ?? null
    this.ort3 = ort3 ?? null
    this.bemerkungen = bemerkungen ?? null
    this.changed = changed ?? new window.Date().toISOString()
    this.changed_by = changed_by ?? null
    this._rev = _rev ?? null
    this._parent_rev = _parent_rev ?? null
    this._revisions = _revisions ?? null
    this._depth = _depth ?? 1
    this._deleted = _deleted ?? false
    this._deleted_indexable = _deleted ? 1 : 0
    this._conflicts = _conflicts ?? null
  }

  async kultur() {
    return await dexie.kulturs.get(
      this.kultur_id ?? '99999999-9999-9999-9999-999999999999',
    )
  }

  async events({ store }) {
    return await collectionFromTable({
      table: 'event',
      where: addTotalCriteriaToWhere({
        store,
        table: 'event',
        where: { teilkultur_id: this.id },
      }),
    }).toArray()
  }

  async teilzaehlungs() {
    return await collectionFromTable({
      table: 'teilzaehlung',
      where: addTotalCriteriaToWhere({
        store,
        table: 'teilzaehlung',
        where: { teilkultur_id: this.id },
      }),
    }).toArray()
  }

  removeConflict(_rev: string) {
    this._conflicts = this._conflicts.filter((r) => r !== _rev)
  }

  async edit({ field, value, store }) {
    const { addQueuedQuery, user, unsetError } = store

    unsetError(`teilkultur`)
    // first build the part that will be revisioned
    const newDepth = this._depth + 1
    const newObject = {
      teilkultur_id: this.id,
      kultur_id: field === 'kultur_id' ? value : this.kultur_id,
      name: field === 'name' ? toStringIfPossible(value) : this.name,
      ort1: field === 'ort1' ? toStringIfPossible(value) : this.ort1,
      ort2: field === 'ort2' ? toStringIfPossible(value) : this.ort2,
      ort3: field === 'ort3' ? toStringIfPossible(value) : this.ort3,
      bemerkungen:
        field === 'bemerkungen' ? toStringIfPossible(value) : this.bemerkungen,
      _parent_rev: this._rev,
      _depth: newDepth,
      _deleted: field === '_deleted' ? value : this._deleted,
    }
    const rev = `${newDepth}-${md5(JSON.stringify(newObject))}`
    // DO NOT include id in rev - or revs with same data will conflict
    newObject.id = uuidv1()
    newObject._rev = rev
    // do not revision the following fields as this leads to unwanted conflicts
    newObject.changed = new window.Date().toISOString()
    newObject.changed_by = user.email
    // convert to string as hasura does not support arrays yet
    // https://github.com/hasura/graphql-engine/pull/2243
    newObject._revisions = this._revisions
      ? toPgArray([rev, ...this._revisions])
      : toPgArray([rev])
    addQueuedQuery({
      name: 'mutateInsert_teilkultur_rev_one',
      variables: JSON.stringify({
        object: newObject,
        on_conflict: {
          constraint: 'teilkultur_rev_pkey',
          update_columns: ['id'],
        },
      }),
      revertTable: 'teilkultur',
      revertId: this.id,
      revertField: field,
      revertValue: this[field],
      newValue: value,
    })
    // optimistically update store
    const storeUpdate = {
      [field]: value,
      _depth: newObject._depth,
      _rev: newObject._rev,
      _parent_rev: newObject._parent_rev,
      changed: newObject.changed,
      changed_by: newObject.changed_by,
      _revisions: this._revisions ? [rev, ...this._revisions] : [rev],
    }
    // set all indexable boolean fields
    addIndexableBooleans({ table: 'teilkultur', object: storeUpdate })

    dexie.teilkulturs.update(this.id, storeUpdate)
  }

  delete({ store }) {
    this.edit({ field: '_deleted', value: true, store })
  }
}

export interface IZaehlung {
  id: string
  kultur_id?: string
  datum?: Date
  prognose?: boolean
  prognose_indexable?: number
  bemerkungen?: string
  changed?: Date
  changed_by?: string
  _rev?: string
  _parent_rev?: string
  _revisions?: string[]
  _depth?: number
  _deleted?: boolean
  _deleted_indexable?: number
  _conflicts?: string[]
}

export class Zaehlung implements IZaehlung {
  id: string
  kultur_id?: string
  datum?: Date
  prognose?: boolean
  prognose_indexable?: number
  bemerkungen?: string
  changed?: Date
  changed_by?: string
  _rev?: string
  _parent_rev?: string
  _revisions?: string[]
  _depth?: number
  _deleted?: boolean
  _deleted_indexable?: number
  _conflicts?: string[]

  constructor(
    id: string,
    kultur_id?: string,
    datum?: Date,
    prognose?: boolean,
    prognose_indexable?: number,
    bemerkungen?: string,
    changed?: Date,
    changed_by?: string,
    _rev?: string,
    _parent_rev?: string,
    _revisions?: string[],
    _depth?: number,
    _deleted?: boolean,
    _deleted_indexable?: number,
    _conflicts?: string[],
  ) {
    this.id = id ?? uuidv1()
    this.kultur_id = kultur_id ?? null
    this.datum = datum ?? null
    this.prognose = prognose ?? false
    this.prognose_indexable = prognose ? 1 : 0
    this.bemerkungen = bemerkungen ?? null
    this.changed = changed ?? new window.Date().toISOString()
    this.changed_by = changed_by ?? null
    this._rev = _rev ?? null
    this._parent_rev = _parent_rev ?? null
    this._revisions = _revisions ?? null
    this._depth = _depth ?? 1
    this._deleted = _deleted ?? false
    this._deleted_indexable = _deleted ? 1 : 0
    this._conflicts = _conflicts ?? null
  }

  async kultur() {
    return await dexie.kulturs.get(
      this.kultur_id ?? '99999999-9999-9999-9999-999999999999',
    )
  }

  async teilzaehlungs({ store }) {
    return await collectionFromTable({
      table: 'teilzaehlung',
      where: addTotalCriteriaToWhere({
        store,
        table: 'teilzaehlung',
        where: { zaehlung_id: this.id },
      }),
    }).toArray()
  }

  async kulturOption() {
    return await dexie.kultur_options.get(
      this.kultur_id ?? '99999999-9999-9999-9999-999999999999',
    )
  }

  async label({ store }) {
    if (!store) {
      throw new Error('Zaehlung, label: need to pass store - it is missing')
    }
    const teilzaehlungs = await collectionFromTable({
      table: 'teilzaehlung',
      where: addTotalCriteriaToWhere({
        store,
        table: 'teilzaehlung',
        where: { zaehlung_id: this.id },
      }),
    }).toArray()

    return await zaehlungLabelFromZaehlung({
      zaehlung: this,
      teilzaehlungs,
    })
  }

  removeConflict(_rev: string) {
    this._conflicts = this._conflicts.filter((r) => r !== _rev)
  }

  async edit({ field, value, store }) {
    const { addQueuedQuery, user, unsetError } = store

    unsetError(`zaehlung`)
    // first build the part that will be revisioned
    const newDepth = this._depth + 1
    const newObject = {
      zaehlung_id: this.id,
      kultur_id: field === 'kultur_id' ? value : this.kultur_id,
      datum: field === 'datum' ? value : this.datum,
      prognose: field === 'prognose' ? value : this.prognose,
      bemerkungen:
        field === 'bemerkungen' ? toStringIfPossible(value) : this.bemerkungen,
      _parent_rev: this._rev,
      _depth: newDepth,
      _deleted: field === '_deleted' ? value : this._deleted,
    }
    const rev = `${newDepth}-${md5(JSON.stringify(newObject))}`
    // DO NOT include id in rev - or revs with same data will conflict
    newObject.id = uuidv1()
    newObject._rev = rev
    // do not revision the following fields as this leads to unwanted conflicts
    newObject.changed = new window.Date().toISOString()
    newObject.changed_by = user.email
    // convert to string as hasura does not support arrays yet
    // https://github.com/hasura/graphql-engine/pull/2243
    newObject._revisions = this._revisions
      ? toPgArray([rev, ...this._revisions])
      : toPgArray([rev])
    addQueuedQuery({
      name: 'mutateInsert_zaehlung_rev_one',
      variables: JSON.stringify({
        object: newObject,
        on_conflict: {
          constraint: 'zaehlung_rev_pkey',
          update_columns: ['id'],
        },
      }),
      revertTable: 'zaehlung',
      revertId: this.id,
      revertField: field,
      revertValue: this[field],
      newValue: value,
    })
    // optimistically update store
    const storeUpdate = {
      [field]: value,
      _depth: newObject._depth,
      _rev: newObject._rev,
      _parent_rev: newObject._parent_rev,
      changed: newObject.changed,
      changed_by: newObject.changed_by,
      _revisions: this._revisions ? [rev, ...this._revisions] : [rev],
    }
    // set all indexable boolean fields
    addIndexableBooleans({ table: 'zaehlung', object: storeUpdate })

    dexie.zaehlungs.update(this.id, storeUpdate)
  }

  delete({ store }) {
    this.edit({ field: '_deleted', value: true, store })
  }
}

export interface ITeilzaehlung {
  id: string
  zaehlung_id?: string
  teilkultur_id?: string
  anzahl_pflanzen?: number
  anzahl_auspflanzbereit?: number
  anzahl_mutterpflanzen?: number
  andere_menge?: string
  auspflanzbereit_beschreibung?: string
  bemerkungen?: string
  prognose_von_tz?: string
  changed?: Date
  changed_by?: string
  _rev?: string
  _parent_rev?: string
  _revisions?: string[]
  _depth?: number
  _deleted?: boolean
  _deleted_indexable?: number
  _conflicts?: string[]
}

export class Teilzaehlung implements ITeilzaehlung {
  id: string
  zaehlung_id?: string
  teilkultur_id?: string
  anzahl_pflanzen?: number
  anzahl_auspflanzbereit?: number
  anzahl_mutterpflanzen?: number
  andere_menge?: string
  auspflanzbereit_beschreibung?: string
  bemerkungen?: string
  prognose_von_tz?: string
  changed?: Date
  changed_by?: string
  _rev?: string
  _parent_rev?: string
  _revisions?: string[]
  _depth?: number
  _deleted?: boolean
  _deleted_indexable?: number
  _conflicts?: string[]

  constructor(
    id: string,
    zaehlung_id?: string,
    teilkultur_id?: string,
    anzahl_pflanzen?: number,
    anzahl_auspflanzbereit?: number,
    anzahl_mutterpflanzen?: number,
    andere_menge?: string,
    auspflanzbereit_beschreibung?: string,
    bemerkungen?: string,
    prognose_von_tz?: string,
    changed?: Date,
    changed_by?: string,
    _rev?: string,
    _parent_rev?: string,
    _revisions?: string[],
    _depth?: number,
    _deleted?: boolean,
    _deleted_indexable?: number,
    _conflicts?: string[],
  ) {
    this.id = id ?? uuidv1()
    this.zaehlung_id = zaehlung_id ?? null
    this.teilkultur_id = teilkultur_id ?? null
    this.anzahl_pflanzen = anzahl_pflanzen ?? null
    this.anzahl_auspflanzbereit = anzahl_auspflanzbereit ?? null
    this.anzahl_mutterpflanzen = anzahl_mutterpflanzen ?? null
    this.andere_menge = andere_menge ?? null
    this.auspflanzbereit_beschreibung = auspflanzbereit_beschreibung ?? null
    this.bemerkungen = bemerkungen ?? null
    this.prognose_von_tz = prognose_von_tz ?? null
    this.changed = changed ?? new window.Date().toISOString()
    this.changed_by = changed_by ?? null
    this._rev = _rev ?? null
    this._parent_rev = _parent_rev ?? null
    this._revisions = _revisions ?? null
    this._depth = _depth ?? 1
    this._deleted = _deleted ?? false
    this._deleted_indexable = _deleted ? 1 : 0
    this._conflicts = _conflicts ?? null
  }

  async zaehlung() {
    return await dexie.zaehlungs.get(
      this.zaehlung_id ?? '99999999-9999-9999-9999-999999999999',
    )
  }

  async teilkultur() {
    return await dexie.teilkulturs.get(
      this.teilkultur_id ?? '99999999-9999-9999-9999-999999999999',
    )
  }

  label() {
    return teilkulturLabelFromTeilkultur({ teilkultur: this })
  }

  async edit({ field, value, store }) {
    const { addQueuedQuery, user, unsetError } = store

    unsetError(`teilzaehlung`)
    // first build the part that will be revisioned
    const newDepth = this._depth + 1
    const newObject = {
      teilzaehlung_id: this.id,
      zaehlung_id: field === 'zaehlung_id' ? value : this.zaehlung_id,
      teilkultur_id: field === 'teilkultur_id' ? value : this.teilkultur_id,
      anzahl_pflanzen:
        field === 'anzahl_pflanzen' ? value : this.anzahl_pflanzen,
      anzahl_auspflanzbereit:
        field === 'anzahl_auspflanzbereit'
          ? value
          : this.anzahl_auspflanzbereit,
      anzahl_mutterpflanzen:
        field === 'anzahl_mutterpflanzen' ? value : this.anzahl_mutterpflanzen,
      andere_menge:
        field === 'andere_menge'
          ? toStringIfPossible(value)
          : this.andere_menge,
      auspflanzbereit_beschreibung:
        field === 'auspflanzbereit_beschreibung'
          ? toStringIfPossible(value)
          : this.auspflanzbereit_beschreibung,
      bemerkungen:
        field === 'bemerkungen' ? toStringIfPossible(value) : this.bemerkungen,
      prognose_von_tz:
        field === 'prognose_von_tz' ? value : this.prognose_von_tz,
      _parent_rev: this._rev,
      _depth: newDepth,
      _deleted: field === '_deleted' ? value : this._deleted,
    }
    const rev = `${newDepth}-${md5(JSON.stringify(newObject))}`
    // DO NOT include id in rev - or revs with same data will conflict
    newObject.id = uuidv1()
    newObject._rev = rev
    // do not revision the following fields as this leads to unwanted conflicts
    newObject.changed = new window.Date().toISOString()
    newObject.changed_by = user.email
    // convert to string as hasura does not support arrays yet
    // https://github.com/hasura/graphql-engine/pull/2243
    newObject._revisions = this._revisions
      ? toPgArray([rev, ...this._revisions])
      : toPgArray([rev])
    addQueuedQuery({
      name: 'mutateInsert_teilzaehlung_rev_one',
      variables: JSON.stringify({
        object: newObject,
        on_conflict: {
          constraint: 'teilzaehlung_rev_pkey',
          update_columns: ['id'],
        },
      }),
      revertTable: 'teilzaehlung',
      revertId: this.id,
      revertField: field,
      revertValue: this[field],
      newValue: value,
    })
    // optimistically update store
    const storeUpdate = {
      [field]: value,
      _depth: newObject._depth,
      _rev: newObject._rev,
      _parent_rev: newObject._parent_rev,
      changed: newObject.changed,
      changed_by: newObject.changed_by,
      _revisions: this._revisions ? [rev, ...this._revisions] : [rev],
    }
    // set all indexable boolean fields
    addIndexableBooleans({ table: 'teilzaehlung', object: storeUpdate })

    await dexie.teilzaehlungs.update(this.id, storeUpdate)
    return
  }

  delete({ store }) {
    this.edit({ field: '_deleted', value: true, store })
  }
}

export interface IPerson {
  id?: string
  nr?: string
  vorname?: string
  name?: string
  adresszusatz?: string
  strasse?: string
  plz?: number
  ort?: string
  telefon_privat?: string
  telefon_geschaeft?: string
  telefon_mobile?: string
  email?: string
  kein_email?: boolean
  kein_email_indexable?: number
  bemerkungen?: string
  changed?: Date
  changed_by?: string
  account_id?: string
  user_role_id?: string
  kommerziell?: boolean
  kommerziell_indexable?: number
  info?: boolean
  info_indexable?: number
  aktiv?: boolean
  aktiv_indexable?: number
  _rev?: string
  _parent_rev?: string
  _revisions?: string[]
  _depth?: number
  _deleted?: boolean
  _deleted_indexable?: number
  _conflicts?: string[]
}

export class Person implements IPerson {
  id?: string
  nr?: string
  vorname?: string
  name?: string
  adresszusatz?: string
  strasse?: string
  plz?: number
  ort?: string
  telefon_privat?: string
  telefon_geschaeft?: string
  telefon_mobile?: string
  email?: string
  kein_email?: boolean
  kein_email_indexable?: number
  bemerkungen?: string
  changed?: Date
  changed_by?: string
  account_id?: string
  user_role_id?: string
  kommerziell?: boolean
  kommerziell_indexable?: number
  info?: boolean
  info_indexable?: number
  aktiv?: boolean
  aktiv_indexable?: number
  _rev?: string
  _parent_rev?: string
  _revisions?: string[]
  _depth?: number
  _deleted?: boolean
  _deleted_indexable?: number
  _conflicts?: string[]

  constructor(
    id?: string,
    nr?: string,
    vorname?: string,
    name?: string,
    adresszusatz?: string,
    strasse?: string,
    plz?: number,
    ort?: string,
    telefon_privat?: string,
    telefon_geschaeft?: string,
    telefon_mobile?: string,
    email?: string,
    kein_email?: boolean,
    kein_email_indexable?: number,
    bemerkungen?: string,
    changed?: Date,
    changed_by?: string,
    account_id?: string,
    user_role_id?: string,
    kommerziell?: boolean,
    kommerziell_indexable?: number,
    info?: boolean,
    info_indexable?: number,
    aktiv?: boolean,
    aktiv_indexable?: number,
    _rev?: string,
    _parent_rev?: string,
    _revisions?: string[],
    _depth?: number,
    _deleted?: boolean,
    _deleted_indexable?: number,
    _conflicts?: string[],
  ) {
    this.id = id ?? uuidv1()
    this.nr = nr ?? null
    this.vorname = vorname ?? null
    this.name = name ?? null
    this.adresszusatz = adresszusatz ?? null
    this.strasse = strasse ?? null
    this.plz = plz ?? null
    this.ort = ort ?? null
    this.telefon_privat = telefon_privat ?? null
    this.telefon_geschaeft = telefon_geschaeft ?? null
    this.telefon_mobile = telefon_mobile ?? null
    this.email = email ?? null
    this.kein_email = kein_email ?? false
    this.kein_email_indexable = kein_email === false ? 0 : 1
    this.bemerkungen = bemerkungen ?? null
    this.changed = changed ?? new window.Date().toISOString()
    this.changed_by = changed_by ?? null
    this.account_id = account_id ?? null
    this.user_role_id = user_role_id ?? null
    this.kommerziell = kommerziell ?? false
    this.kommerziell_indexable = kommerziell === false ? 0 : 1
    this.info = info ?? false
    this.info_indexable = info ? 1 : 0
    this.aktiv = aktiv ?? true
    this.aktiv_indexable = aktiv === false ? 0 : 1
    this._rev = _rev ?? null
    this._parent_rev = _parent_rev ?? null
    this._revisions = _revisions ?? null
    this._depth = _depth ?? 1
    this._deleted = _deleted ?? false
    this._deleted_indexable = _deleted ? 1 : 0
    this._conflicts = _conflicts ?? null
  }

  async sammelLieferungs({ store }) {
    return await collectionFromTable({
      table: 'sammel_lieferung',
      where: addTotalCriteriaToWhere({
        store,
        table: 'sammel_lieferung',
        where: { person_id: this.id },
      }),
    }).toArray()
  }

  async lieferungs({ store }) {
    return await collectionFromTable({
      table: 'lieferung',
      where: addTotalCriteriaToWhere({
        store,
        table: 'lieferung',
        where: { person_id: this.id },
      }),
    }).toArray()
  }

  async sammlungs({ store }) {
    return await collectionFromTable({
      table: 'sammlung',
      where: addTotalCriteriaToWhere({
        store,
        table: 'sammlung',
        where: { person_id: this.id },
      }),
    }).toArray()
  }

  async gartens({ store }) {
    return await collectionFromTable({
      table: 'garten',
      where: addTotalCriteriaToWhere({
        store,
        table: 'garten',
        where: { person_id: this.id },
      }),
    }).toArray()
  }

  async events({ store }) {
    return await collectionFromTable({
      table: 'event',
      where: addTotalCriteriaToWhere({
        store,
        table: 'event',
        where: { person_id: this.id },
      }),
    }).toArray()
  }

  fullname() {
    if (this.vorname && this.name) {
      return `${this.vorname} ${this.name}`
    }
    if (this.name) return this.name
    if (this.vorname) return this.vorname
    return undefined
  }

  removeConflict(_rev: string) {
    this._conflicts = this._conflicts.filter((r) => r !== _rev)
  }

  async edit({ field, value, store }) {
    const { addQueuedQuery, user, unsetError } = store

    unsetError(`person`)
    // first build the part that will be revisioned
    const newDepth = this._depth + 1
    const newObject = {
      person_id: this.id,
      nr: field === 'nr' ? toStringIfPossible(value) : this.nr,
      vorname: field === 'vorname' ? toStringIfPossible(value) : this.vorname,
      name: field === 'name' ? toStringIfPossible(value) : this.name,
      adresszusatz:
        field === 'adresszusatz'
          ? toStringIfPossible(value)
          : this.adresszusatz,
      strasse: field === 'strasse' ? toStringIfPossible(value) : this.strasse,
      plz: field === 'plz' ? value : this.plz,
      ort: field === 'ort' ? toStringIfPossible(value) : this.ort,
      telefon_privat:
        field === 'telefon_privat'
          ? toStringIfPossible(value)
          : this.telefon_privat,
      telefon_geschaeft:
        field === 'telefon_geschaeft'
          ? toStringIfPossible(value)
          : this.telefon_geschaeft,
      telefon_mobile:
        field === 'telefon_mobile'
          ? toStringIfPossible(value)
          : this.telefon_mobile,
      email: field === 'email' ? toStringIfPossible(value) : this.email,
      kein_email: field === 'kein_email' ? value : this.kein_email,
      bemerkungen:
        field === 'bemerkungen' ? toStringIfPossible(value) : this.bemerkungen,
      account_id:
        field === 'account_id' ? toStringIfPossible(value) : this.account_id,
      user_role_id: field === 'user_role_id' ? value : this.user_role_id,
      kommerziell: field === 'kommerziell' ? value : this.kommerziell,
      info: field === 'info' ? value : this.info,
      aktiv: field === 'aktiv' ? value : this.aktiv,
      _parent_rev: this._rev,
      _depth: newDepth,
      _deleted: field === '_deleted' ? value : this._deleted,
    }
    const rev = `${newDepth}-${md5(JSON.stringify(newObject))}`
    // DO NOT include id in rev - or revs with same data will conflict
    newObject.id = uuidv1()
    newObject._rev = rev
    // do not revision the following fields as this leads to unwanted conflicts
    newObject.changed = new window.Date().toISOString()
    newObject.changed_by = user.email
    // convert to string as hasura does not support arrays yet
    // https://github.com/hasura/graphql-engine/pull/2243
    newObject._revisions = this._revisions
      ? toPgArray([rev, ...this._revisions])
      : toPgArray([rev])
    addQueuedQuery({
      name: 'mutateInsert_person_rev_one',
      variables: JSON.stringify({
        object: newObject,
        on_conflict: {
          constraint: 'person_rev_pkey',
          update_columns: ['id'],
        },
      }),
      revertTable: 'person',
      revertId: this.id,
      revertField: field,
      revertValue: this[field],
      newValue: value,
    })
    // optimistically update store
    const storeUpdate = {
      [field]: value,
      _depth: newObject._depth,
      _rev: newObject._rev,
      _parent_rev: newObject._parent_rev,
      changed: newObject.changed,
      changed_by: newObject.changed_by,
      _revisions: this._revisions ? [rev, ...this._revisions] : [rev],
    }
    // set all indexable boolean fields
    addIndexableBooleans({ table: 'person', object: storeUpdate })

    dexie.persons.update(this.id, storeUpdate)
  }
  delete({ store }) {
    this.edit({ field: '_deleted', value: true, store })
    // delete firebase user
    deleteAccount({ store, person: this })
  }
}

export interface ISammelLieferung {
  id: string
  art_id?: string
  person_id?: string
  von_sammlung_id?: string
  von_kultur_id?: string
  datum?: Date
  nach_kultur_id?: string
  nach_ausgepflanzt?: boolean
  nach_ausgepflanzt_indexable?: number
  von_anzahl_individuen?: number
  anzahl_pflanzen?: number
  anzahl_auspflanzbereit?: number
  gramm_samen?: number
  andere_menge?: string
  geplant?: boolean
  geplant_indexable?: number
  bemerkungen?: string
  changed?: Date
  changed_by?: string
  _rev?: string
  _parent_rev?: string
  _revisions?: string[]
  _depth?: number
  _deleted?: boolean
  _deleted_indexable?: number
  _conflicts?: string[]
}

export class SammelLieferung implements ISammelLieferung {
  id: string
  art_id?: string
  person_id?: string
  von_sammlung_id?: string
  von_kultur_id?: string
  datum?: Date
  nach_kultur_id?: string
  nach_ausgepflanzt?: boolean
  nach_ausgepflanzt_indexable?: number
  von_anzahl_individuen?: number
  anzahl_pflanzen?: number
  anzahl_auspflanzbereit?: number
  gramm_samen?: number
  andere_menge?: string
  geplant?: boolean
  geplant_indexable?: number
  bemerkungen?: string
  changed?: Date
  changed_by?: string
  _rev?: string
  _parent_rev?: string
  _revisions?: string[]
  _depth?: number
  _deleted?: boolean
  _deleted_indexable?: number
  _conflicts?: string[]

  constructor(
    id: string,
    art_id?: string,
    person_id?: string,
    von_sammlung_id?: string,
    von_kultur_id?: string,
    datum?: Date,
    nach_kultur_id?: string,
    nach_ausgepflanzt?: boolean,
    nach_ausgepflanzt_indexable?: number,
    von_anzahl_individuen?: number,
    anzahl_pflanzen?: number,
    anzahl_auspflanzbereit?: number,
    gramm_samen?: number,
    andere_menge?: string,
    geplant?: boolean,
    geplant_indexable?: number,
    bemerkungen?: string,
    changed?: Date,
    changed_by?: string,
    _rev?: string,
    _parent_rev?: string,
    _revisions?: string[],
    _depth?: number,
    _deleted?: boolean,
    _deleted_indexable?: number,
    _conflicts?: string[],
  ) {
    this.id = id ?? uuidv1()
    this.art_id = art_id ?? null
    this.person_id = person_id ?? null
    this.von_sammlung_id = von_sammlung_id ?? null
    this.von_kultur_id = von_kultur_id ?? null
    this.datum = datum ?? null
    this.nach_kultur_id = nach_kultur_id ?? null
    this.nach_ausgepflanzt = nach_ausgepflanzt ?? false
    this.nach_ausgepflanzt_indexable = nach_ausgepflanzt ? 1 : 0
    this.von_anzahl_individuen = von_anzahl_individuen ?? null
    this.anzahl_pflanzen = anzahl_pflanzen ?? null
    this.anzahl_auspflanzbereit = anzahl_auspflanzbereit ?? null
    this.gramm_samen = gramm_samen ?? null
    this.andere_menge = andere_menge ?? null
    this.geplant = geplant ?? false
    this.geplant_indexable = geplant ? 1 : 0
    this.bemerkungen = bemerkungen ?? null
    this.changed = changed ?? new window.Date().toISOString()
    this.changed_by = changed_by ?? null
    this._rev = _rev ?? null
    this._parent_rev = _parent_rev ?? null
    this._revisions = _revisions ?? null
    this._depth = _depth ?? 1
    this._deleted = _deleted ?? false
    this._deleted_indexable = _deleted ? 1 : 0
    this._conflicts = _conflicts ?? null
  }

  async art() {
    return await dexie.arts.get(
      this.art_id ?? '99999999-9999-9999-9999-999999999999',
    )
  }

  async person() {
    return await dexie.persons.get(
      this.person_id ?? '99999999-9999-9999-9999-999999999999',
    )
  }

  async vonSammlung() {
    return await dexie.sammlungs.get(
      this.von_sammlung_id ?? '99999999-9999-9999-9999-999999999999',
    )
  }

  async vonKultur() {
    return await dexie.kulturs.get(
      this.von_kultur_id ?? '99999999-9999-9999-9999-999999999999',
    )
  }

  async nachKultur() {
    return await dexie.kulturs.get(
      this.nach_kultur_id ?? '99999999-9999-9999-9999-999999999999',
    )
  }

  async label() {
    const vonKultur = await dexie.kulturs.get(
      this.von_kultur_id ?? '99999999-9999-9999-9999-999999999999',
    )
    const vonGarten = await dexie.gartens.get(
      vonKultur?.garten_id ?? '99999999-9999-9999-9999-999999999999',
    )
    const gartenLabel = await vonGarten?.label()
    const person = await dexie.persons.get(
      this.person_id ?? '99999999-9999-9999-9999-999999999999',
    )
    const personLabel = person ? personLabelFromPerson({ person }) : undefined
    const datumLabel = this.datum
      ? DateTime.fromSQL(this.datum).toFormat('yyyy.LL.dd')
      : `Kein Datum. ID: ${this.id}`
    const von = gartenLabel ? `von: ${gartenLabel}` : ''
    const label = [datumLabel, von, personLabel].filter((e) => !!e).join('; ')

    return label
  }

  removeConflict(_rev: string) {
    this._conflicts = this._conflicts.filter((r) => r !== _rev)
  }

  async edit({ field, value, store }) {
    const { addQueuedQuery, user, unsetError } = store
    const userPerson: Person = await dexie.persons.get({
      account_id: user.uid ?? '99999999-9999-9999-9999-999999999999',
    })
    const userPersonOption = await dexie.person_options.get(userPerson.id)

    unsetError(`sammel_lieferung`)
    // first build the part that will be revisioned
    const newDepth = this._depth + 1
    const newObject = {
      sammel_lieferung_id: this.id,
      art_id: field === 'art_id' ? value : this.art_id,
      person_id: field === 'person_id' ? value : this.person_id,
      von_sammlung_id:
        field === 'von_sammlung_id' ? value : this.von_sammlung_id,
      von_kultur_id: field === 'von_kultur_id' ? value : this.von_kultur_id,
      datum: field === 'datum' ? value : this.datum,
      nach_kultur_id: field === 'nach_kultur_id' ? value : this.nach_kultur_id,
      nach_ausgepflanzt:
        field === 'nach_ausgepflanzt' ? value : this.nach_ausgepflanzt,
      von_anzahl_individuen:
        field === 'von_anzahl_individuen' ? value : this.von_anzahl_individuen,
      anzahl_pflanzen:
        field === 'anzahl_pflanzen' ? value : this.anzahl_pflanzen,
      anzahl_auspflanzbereit:
        field === 'anzahl_auspflanzbereit'
          ? value
          : this.anzahl_auspflanzbereit,
      gramm_samen: field === 'gramm_samen' ? value : this.gramm_samen,
      andere_menge:
        field === 'andere_menge'
          ? toStringIfPossible(value)
          : this.andere_menge,
      geplant: field === 'geplant' ? value : this.geplant,
      bemerkungen:
        field === 'bemerkungen' ? toStringIfPossible(value) : this.bemerkungen,
      _parent_rev: this._rev,
      _depth: newDepth,
      _deleted: field === '_deleted' ? value : this._deleted,
    }
    const rev = `${newDepth}-${md5(JSON.stringify(newObject))}`
    // DO NOT include id in rev - or revs with same data will conflict
    newObject.id = uuidv1()
    newObject._rev = rev
    // do not revision the following fields as this leads to unwanted conflicts
    newObject.changed = new window.Date().toISOString()
    newObject.changed_by = user.email
    // convert to string as hasura does not support arrays yet
    // https://github.com/hasura/graphql-engine/pull/2243
    newObject._revisions = this._revisions
      ? toPgArray([rev, ...this._revisions])
      : toPgArray([rev])
    addQueuedQuery({
      name: 'mutateInsert_sammel_lieferung_rev_one',
      variables: JSON.stringify({
        object: newObject,
        on_conflict: {
          constraint: 'sammel_lieferung_rev_pkey',
          update_columns: ['id'],
        },
      }),
      revertTable: 'sammel_lieferung',
      revertId: this.id,
      revertField: field,
      revertValue: this[field],
      newValue: value,
    })
    // optimistically update store
    const storeUpdate = {
      [field]: value,
      _depth: newObject._depth,
      _rev: newObject._rev,
      _parent_rev: newObject._parent_rev,
      changed: newObject.changed,
      changed_by: newObject.changed_by,
      _revisions: this._revisions ? [rev, ...this._revisions] : [rev],
    }
    // set all indexable boolean fields
    addIndexableBooleans({ table: 'sammel_lieferung', object: storeUpdate })

    dexie.sammel_lieferungs.update(this.id, storeUpdate)
    const sl_auto_copy_edits = userPersonOption?.sl_auto_copy_edits
    setTimeout(() => {
      // copy to all lieferungen
      if (sl_auto_copy_edits) {
        const newSammelLieferung = {
          ...newObject,
          id: newObject.sammel_lieferung_id,
        }
        delete newSammelLieferung.sammel_lieferung_id
        // TODO: reinstate when file was copied
        // updateAllLieferungen({
        //   sammelLieferung: newSammelLieferung,
        //   store,
        //   field,
        // })
      }
    }, 50)
  }

  delete({ store }) {
    this.edit({ field: '_deleted', value: true, store })
  }
}

export interface IEvent {
  id: string
  kultur_id?: string
  teilkultur_id?: string
  person_id?: string
  beschreibung?: string
  geplant?: boolean
  geplant_indexable?: number
  datum?: Date
  changed?: Date
  changed_by?: string
  _rev?: string
  _parent_rev?: string
  _revisions?: string[]
  _depth?: number
  _deleted?: boolean
  _deleted_indexable?: number
  _conflicts?: string[]
}

export class Event implements IEvent {
  id: string
  kultur_id?: string
  teilkultur_id?: string
  person_id?: string
  beschreibung?: string
  geplant?: boolean
  geplant_indexable?: number
  datum?: Date
  changed?: Date
  changed_by?: string
  _rev?: string
  _parent_rev?: string
  _revisions?: string[]
  _depth?: number
  _deleted?: boolean
  _deleted_indexable?: number
  _conflicts?: string[]

  constructor(
    id: string,
    kultur_id?: string,
    teilkultur_id?: string,
    person_id?: string,
    beschreibung?: string,
    geplant?: boolean,
    geplant_indexable?: number,
    datum?: Date,
    changed?: Date,
    changed_by?: string,
    _rev?: string,
    _parent_rev?: string,
    _revisions?: string[],
    _depth?: number,
    _deleted?: boolean,
    _deleted_indexable?: number,
    _conflicts?: string[],
  ) {
    this.id = id ?? uuidv1()
    this.kultur_id = kultur_id ?? null
    this.teilkultur_id = teilkultur_id ?? null
    this.person_id = person_id ?? null
    this.beschreibung = beschreibung ?? null
    this.geplant = geplant ?? false
    this.geplant_indexable = geplant ? 1 : 0
    this.datum = datum ?? null
    this.changed = changed ?? new window.Date().toISOString()
    this.changed_by = changed_by ?? null
    this._rev = _rev ?? null
    this._parent_rev = _parent_rev ?? null
    this._revisions = _revisions ?? null
    this._depth = _depth ?? 1
    this._deleted = _deleted ?? null
    this._deleted_indexable = _deleted ? 1 : 0
    this._conflicts = _conflicts ?? null
  }

  async kultur() {
    return await dexie.kulturs.get(
      this.kultur_id ?? '99999999-9999-9999-9999-999999999999',
    )
  }

  async teilkultur() {
    return await dexie.teilkulturs.get(
      this.teilkultur_id ?? '99999999-9999-9999-9999-999999999999',
    )
  }

  async person() {
    return await dexie.persons.get(
      this.person_id ?? '99999999-9999-9999-9999-999999999999',
    )
  }

  label() {
    return eventLabelFromEvent({
      event: this,
    })
  }

  removeConflict(_rev: string) {
    this._conflicts = this._conflicts.filter((r) => r !== _rev)
  }

  async edit({ field, value, store }) {
    const { addQueuedQuery, user, unsetError } = store

    unsetError(`event`)
    // first build the part that will be revisioned
    const newDepth = this._depth + 1
    const newObject = {
      event_id: this.id,
      kultur_id: field === 'kultur_id' ? value : this.kultur_id,
      teilkultur_id: field === 'teilkultur_id' ? value : this.teilkultur_id,
      person_id: field === 'person_id' ? value : this.person_id,
      beschreibung:
        field === 'beschreibung'
          ? toStringIfPossible(value)
          : this.beschreibung,
      geplant: field === 'geplant' ? value : this.geplant,
      datum: field === 'datum' ? value : this.datum,
      _parent_rev: this._rev,
      _depth: newDepth,
      _deleted: field === '_deleted' ? value : this._deleted,
    }
    const rev = `${newDepth}-${md5(JSON.stringify(newObject))}`
    // DO NOT include id in rev - or revs with same data will conflict
    newObject.id = uuidv1()
    newObject._rev = rev
    // do not revision the following fields as this leads to unwanted conflicts
    newObject.changed = new window.Date().toISOString()
    newObject.changed_by = user.email
    // convert to string as hasura does not support arrays yet
    // https://github.com/hasura/graphql-engine/pull/2243
    newObject._revisions = this._revisions
      ? toPgArray([rev, ...this._revisions])
      : toPgArray([rev])
    addQueuedQuery({
      name: 'mutateInsert_event_rev_one',
      variables: JSON.stringify({
        object: newObject,
        on_conflict: {
          constraint: 'event_rev_pkey',
          update_columns: ['id'],
        },
      }),
      revertTable: 'event',
      revertId: this.id,
      revertField: field,
      revertValue: this[field],
      newValue: value,
    })
    // optimistically update store
    const storeUpdate = {
      [field]: value,
      _depth: newObject._depth,
      _rev: newObject._rev,
      _parent_rev: newObject._parent_rev,
      changed: newObject.changed,
      changed_by: newObject.changed_by,
      _revisions: this._revisions ? [rev, ...this._revisions] : [rev],
    }
    // set all indexable boolean fields
    addIndexableBooleans({ table: 'event', object: storeUpdate })

    dexie.events.update(this.id, storeUpdate)
  }

  delete({ store }) {
    this.edit({ field: '_deleted', value: true, store })
  }
}

export interface IAv {
  id: string
  art_id?: string
  person_id?: string
  changed?: Date
  changed_by?: string
  _rev?: string
  _parent_rev?: string
  _revisions?: string[]
  _depth?: number
  _deleted?: boolean
  _deleted_indexable?: number
  _conflicts?: string[]
}

export class Av implements IAv {
  id: string
  art_id?: string
  person_id?: string
  changed?: Date
  changed_by?: string
  _rev?: string
  _parent_rev?: string
  _revisions?: string[]
  _depth?: number
  _deleted?: boolean
  _deleted_indexable?: number
  _conflicts?: string[]

  constructor(
    id: string,
    art_id?: string,
    person_id?: string,
    changed?: Date,
    changed_by?: string,
    _rev?: string,
    _parent_rev?: string,
    _revisions?: string[],
    _depth?: number,
    _deleted?: boolean,
    _deleted_indexable?: number,
    _conflicts?: string[],
  ) {
    this.id = id ?? uuidv1()
    this.art_id = art_id ?? null
    this.person_id = person_id ?? null
    this.changed = changed ?? new window.Date().toISOString()
    this.changed_by = changed_by ?? null
    this._rev = _rev ?? null
    this._parent_rev = _parent_rev ?? null
    this._revisions = _revisions ?? null
    this._depth = _depth ?? 1
    this._deleted = _deleted ?? false
    this._deleted_indexable = _deleted ? 1 : 0
    this._conflicts = _conflicts ?? null
  }

  async person() {
    return await dexie.persons.get(
      this.person_id ?? '99999999-9999-9999-9999-999999999999',
    )
  }

  async art() {
    return await dexie.arts.get(
      this.art_id ?? '99999999-9999-9999-9999-999999999999',
    )
  }

  async personLabel() {
    const person = await dexie.persons.get(
      this.person_id ?? '99999999-9999-9999-9999-999999999999',
    )

    return personLabelFromPerson({ person })
  }

  async artLabel() {
    const art = await dexie.arts.get(
      this.art_id ?? '99999999-9999-9999-9999-999999999999',
    )

    return await art?.label()
  }

  removeConflict(_rev: string) {
    this._conflicts = this._conflicts.filter((r) => r !== _rev)
  }

  async edit({ field, value, store }) {
    const { addQueuedQuery, user, unsetError } = store

    unsetError(`av`)
    // first build the part that will be revisioned
    const newDepth = this._depth + 1
    const newObject = {
      av_id: this.id,
      art_id: field === 'art_id' ? value : this.art_id,
      person_id: field === 'person_id' ? value : this.person_id,
      _parent_rev: this._rev,
      _depth: newDepth,
      _deleted: field === '_deleted' ? value : this._deleted,
    }
    const rev = `${newDepth}-${md5(JSON.stringify(newObject))}`
    // DO NOT include id in rev - or revs with same data will conflict
    newObject.id = uuidv1()
    newObject._rev = rev
    // do not revision the following fields as this leads to unwanted conflicts
    newObject.changed = new window.Date().toISOString()
    newObject.changed_by = user.email
    // convert to string as hasura does not support arrays yet
    // https://github.com/hasura/graphql-engine/pull/2243
    newObject._revisions = this._revisions
      ? toPgArray([rev, ...this._revisions])
      : toPgArray([rev])
    addQueuedQuery({
      name: 'mutateInsert_av_rev_one',
      variables: JSON.stringify({
        object: newObject,
        on_conflict: {
          constraint: 'av_rev_pkey',
          update_columns: ['id'],
        },
      }),
      revertTable: 'av',
      revertId: this.id,
      revertField: field,
      revertValue: this[field],
      newValue: value,
    })
    // optimistically update store
    const storeUpdate = {
      [field]: value,
      _depth: newObject._depth,
      _rev: newObject._rev,
      _parent_rev: newObject._parent_rev,
      changed: newObject.changed,
      changed_by: newObject.changed_by,
      _revisions: this._revisions ? [rev, ...this._revisions] : [rev],
    }
    // set all indexable boolean fields
    addIndexableBooleans({ table: 'av', object: storeUpdate })

    dexie.avs.update(this.id, storeUpdate)
  }

  delete({ store }) {
    this.edit({ field: '_deleted', value: true, store })
  }
}

export interface IGv {
  id: string
  garten_id?: string
  person_id?: string
  changed?: Date
  changed_by?: string
  _rev?: string
  _parent_rev?: string
  _revisions?: string[]
  _depth?: number
  _deleted?: boolean
  _deleted_indexable?: number
  _conflicts?: string[]
}

export class Gv implements IGv {
  id: string
  garten_id?: string
  person_id?: string
  changed?: Date
  changed_by?: string
  _rev?: string
  _parent_rev?: string
  _revisions?: string[]
  _depth?: number
  _deleted?: boolean
  _deleted_indexable?: number
  _conflicts?: string[]

  constructor(
    id: string,
    garten_id?: string,
    person_id?: string,
    changed?: Date,
    changed_by?: string,
    _rev?: string,
    _parent_rev?: string,
    _revisions?: string[],
    _depth?: number,
    _deleted?: boolean,
    _deleted_indexable?: number,
    _conflicts?: string[],
  ) {
    this.id = id ?? uuidv1()
    this.garten_id = garten_id ?? null
    this.person_id = person_id ?? null
    this.changed = changed ?? new window.Date().toISOString()
    this.changed_by = changed_by ?? null
    this._rev = _rev ?? null
    this._parent_rev = _parent_rev ?? null
    this._revisions = _revisions ?? null
    this._depth = _depth ?? 1
    this._deleted = _deleted ?? false
    this._deleted_indexable = _deleted ? 1 : 0
    this._conflicts = _conflicts ?? null
  }

  async person() {
    return await dexie.persons.get(
      this.person_id ?? '99999999-9999-9999-9999-999999999999',
    )
  }

  async garten() {
    return await dexie.gartens.get(
      this.garten_id ?? '99999999-9999-9999-9999-999999999999',
    )
  }

  async personLabel() {
    const person = await dexie.persons.get(
      this.person_id ?? '99999999-9999-9999-9999-999999999999',
    )
    return personLabelFromPerson({ person })
  }

  async gartenLabel() {
    const garten = await dexie.gartens.get(
      this.garten_id ?? '99999999-9999-9999-9999-999999999999',
    )
    return gartenLabelFromGarten({ garten })
  }

  removeConflict(_rev: string) {
    this._conflicts = this._conflicts.filter((r) => r !== _rev)
  }

  async edit({ field, value, store }) {
    const { addQueuedQuery, user, unsetError } = store

    unsetError('gv')
    // first build the part that will be revisioned
    const newDepth = this._depth + 1
    const newObject = {
      gv_id: this.id,
      garten_id: field === 'garten_id' ? value : this.garten_id,
      person_id: field === 'person_id' ? value : this.person_id,
      _parent_rev: this._rev,
      _depth: newDepth,
      _deleted: field === '_deleted' ? value : this._deleted,
    }
    const rev = `${newDepth}-${md5(JSON.stringify(newObject))}`
    // DO NOT include id in rev - or revs with same data will conflict
    newObject.id = uuidv1()
    newObject._rev = rev
    // do not revision the following fields as this leads to unwanted conflicts
    newObject.changed = new window.Date().toISOString()
    newObject.changed_by = user.email
    // convert to string as hasura does not support arrays yet
    // https://github.com/hasura/graphql-engine/pull/2243
    newObject._revisions = this._revisions
      ? toPgArray([rev, ...this._revisions])
      : toPgArray([rev])
    addQueuedQuery({
      name: 'mutateInsert_gv_rev_one',
      variables: JSON.stringify({
        object: newObject,
        on_conflict: {
          constraint: 'gv_rev_pkey',
          update_columns: ['id'],
        },
      }),
      revertTable: 'gv',
      revertId: this.id,
      revertField: field,
      revertValue: this[field],
      newValue: value,
    })
    // optimistically update store
    const storeUpdate = {
      [field]: value,
      _depth: newObject._depth,
      _rev: newObject._rev,
      _parent_rev: newObject._parent_rev,
      changed: newObject.changed,
      changed_by: newObject.changed_by,
      _revisions: this._revisions ? [rev, ...this._revisions] : [rev],
    }
    // set all indexable boolean fields
    addIndexableBooleans({ table: 'gv', object: storeUpdate })

    dexie.gvs.update(this.id, storeUpdate)
  }

  delete({ store }) {
    this.edit({ field: '_deleted', value: true, store })
  }
}

export interface IArtFile {
  id: string
  art_id?: string
  file_id?: string
  file_mime_type?: string
  name?: string
  beschreibung?: string
  changed?: Date
  _rev_at?: number
}

export class ArtFile implements IArtFile {
  id: string
  art_id?: string
  file_id?: string
  file_mime_type?: string
  name?: string
  beschreibung?: string
  changed?: Date
  _rev_at?: number

  constructor(
    id: string,
    art_id?: string,
    file_id?: string,
    file_mime_type?: string,
    name?: string,
    beschreibung?: string,
    changed?: Date,
    _rev_at?: number,
  ) {
    this.id = id ?? uuidv1()
    this.art_id = art_id ?? null
    this.file_id = file_id ?? null
    this.file_mime_type = file_mime_type ?? null
    this.name = name ?? null
    this.beschreibung = beschreibung ?? null
    this.changed = changed ?? new window.Date().toISOString()
    this._rev_at = _rev_at ?? null
  }

  async edit({ field, value, store }) {
    // extract only the needed keys
    const { id, art_id, file_id, file_mime_type, name, beschreibung, changed } =
      this
    const newObject = {
      id,
      art_id,
      file_id,
      file_mime_type,
      name,
      beschreibung,
      changed,
      [field]: value,
      _rev_at: Date.now(),
    }
    const mutation = gql`
      mutation update_art_file(
        $_inc: art_file_inc_input
        $_set: art_file_set_input
        $where: art_file_bool_exp!
      ) {
        update_art_file(_inc: $_inc, _set: $_set, where: $where) {
          returning {
            ...ArtFileFields
          }
        }
      }
      ${artFileFragment}
    `
    const variables = {
      _set: newObject,
      where: { id: { _eq: this.id } },
    }
    const response = await store.gqlClient
      .mutation(mutation, variables)
      .toPromise()
    if (response.error) {
      store.addNotification({
        message: response.error.message,
      })
      return console.log(response.error)
    }
    // updating server is done by calling code
    // optimistically update store
    const storeUpdate = {
      [field]: value,
    }
    await dexie.art_files.update(this.id, storeUpdate)
    return
  }

  async delete({ store }) {
    const mutation = gql`
      mutation delete_art_file($where: art_file_bool_exp!) {
        delete_art_file(where: $where) {
          returning {
            id
          }
        }
      }
    `
    const variables = {
      where: { id: { _eq: this.id } },
    }
    const response = await store.gqlClient
      .mutation(mutation, variables)
      .toPromise()
    if (response.error) {
      store.addNotification({
        message: response.error.message,
      })
      return console.log(response.error)
    }
    // updating server is done by calling code
    await dexie.art_files.delete(this.id)
  }
}

export interface IGartenFile {
  id: string
  garten_id?: string
  file_id?: string
  file_mime_type?: string
  name?: string
  beschreibung?: string
  changed?: Date
  _rev_at?: number
}

export class GartenFile implements IGartenFile {
  id: string
  garten_id?: string
  file_id?: string
  file_mime_type?: string
  name?: string
  beschreibung?: string
  changed?: Date
  _rev_at?: number

  constructor(
    id: string,
    garten_id?: string,
    file_id?: string,
    file_mime_type?: string,
    name?: string,
    beschreibung?: string,
    changed?: Date,
    _rev_at?: number,
  ) {
    this.id = id ?? uuidv1()
    this.garten_id = garten_id ?? null
    this.file_id = file_id ?? null
    this.file_mime_type = file_mime_type ?? null
    this.name = name ?? null
    this.beschreibung = beschreibung ?? null
    this.changed = changed ?? new window.Date().toISOString()
    this._rev_at = _rev_at ?? null
  }

  async edit({ field, value, store }) {
    // extract only the needed keys
    const {
      id,
      garten_id,
      file_id,
      file_mime_type,
      name,
      beschreibung,
      changed,
    } = this
    const newObject = {
      id,
      garten_id,
      file_id,
      file_mime_type,
      name,
      beschreibung,
      changed,
      [field]: value,
      _rev_at: Date.now(),
    }
    const mutation = gql`
      mutation update_garten_file(
        $_inc: garten_file_inc_input
        $_set: garten_file_set_input
        $where: garten_file_bool_exp!
      ) {
        update_garten_file(_inc: $_inc, _set: $_set, where: $where) {
          returning {
            ...GartenFileFields
          }
        }
      }
      ${gartenFileFragment}
    `
    const variables = {
      _set: newObject,
      where: { id: { _eq: this.id } },
    }
    const response = await store.gqlClient
      .mutation(mutation, variables)
      .toPromise()
    if (response.error) {
      store.addNotification({
        message: response.error.message,
      })
      return console.log(response.error)
    }
    // updating server is done by calling code
    // optimistically update store
    const storeUpdate = {
      [field]: value,
    }
    await dexie.garten_files.update(this.id, storeUpdate)
    return
  }

  async delete({ store }) {
    const mutation = gql`
      mutation delete_garten_file($where: garten_file_bool_exp!) {
        delete_garten_file(where: $where) {
          returning {
            id
          }
        }
      }
    `
    const variables = {
      where: { id: { _eq: this.id } },
    }
    const response = await store.gqlClient
      .mutation(mutation, variables)
      .toPromise()
    if (response.error) {
      store.addNotification({
        message: response.error.message,
      })
      return console.log(response.error)
    }
    // updating server is done by calling code
    await dexie.garten_files.delete(this.id)
  }
}

export interface IHerkunftFile {
  id: string
  herkunft_id?: string
  file_id?: string
  file_mime_type?: string
  name?: string
  beschreibung?: string
  changed?: Date
  _rev_at?: number
}

export class HerkunftFile implements IHerkunftFile {
  id: string
  herkunft_id?: string
  file_id?: string
  file_mime_type?: string
  name?: string
  beschreibung?: string
  changed?: Date
  _rev_at?: number

  constructor(
    id: string,
    herkunft_id?: string,
    file_id?: string,
    file_mime_type?: string,
    name?: string,
    beschreibung?: string,
    changed?: Date,
    _rev_at?: number,
  ) {
    this.id = id ?? uuidv1()
    this.herkunft_id = herkunft_id ?? null
    this.file_id = file_id ?? null
    this.file_mime_type = file_mime_type ?? null
    this.name = name ?? null
    this.beschreibung = beschreibung ?? null
    this.changed = changed ?? new window.Date().toISOString()
    this._rev_at = _rev_at ?? null
  }

  async edit({ field, value, store }) {
    // extract only the needed keys
    const {
      id,
      herkunft_id,
      file_id,
      file_mime_type,
      name,
      beschreibung,
      changed,
    } = this
    const newObject = {
      id,
      herkunft_id,
      file_id,
      file_mime_type,
      name,
      beschreibung,
      changed,
      [field]: value,
      _rev_at: Date.now(),
    }
    const mutation = gql`
      mutation update_herkunft_file(
        $_inc: herkunft_file_inc_input
        $_set: herkunft_file_set_input
        $where: herkunft_file_bool_exp!
      ) {
        update_herkunft_file(_inc: $_inc, _set: $_set, where: $where) {
          returning {
            ...HerkunftFileFields
          }
        }
      }
      ${herkunftFileFragment}
    `
    const variables = {
      _set: newObject,
      where: { id: { _eq: this.id } },
    }
    const response = await store.gqlClient
      .mutation(mutation, variables)
      .toPromise()
    if (response.error) {
      store.addNotification({
        message: response.error.message,
      })
      return console.log(response.error)
    }
    // updating server is done by calling code
    // optimistically update store
    const storeUpdate = {
      [field]: value,
    }
    await dexie.herkunft_files.update(this.id, storeUpdate)
    return
  }

  async delete({ store }) {
    const mutation = gql`
      mutation delete_herkunft_file($where: herkunft_file_bool_exp!) {
        delete_herkunft_file(where: $where) {
          returning {
            id
          }
        }
      }
    `
    const variables = {
      where: { id: { _eq: this.id } },
    }
    const response = await store.gqlClient
      .mutation(mutation, variables)
      .toPromise()
    if (response.error) {
      store.addNotification({
        message: response.error.message,
      })
      return console.log(response.error)
    }
    // updating server is done by calling code
    await dexie.herkunft_files.delete(this.id)
  }
}

export interface IKulturFile {
  id: string
  kultur_id?: string
  file_id?: string
  file_mime_type?: string
  name?: string
  beschreibung?: string
  changed?: Date
  _rev_at?: number
}

export class KulturFile implements IKulturFile {
  id: string
  kultur_id?: string
  file_id?: string
  file_mime_type?: string
  name?: string
  beschreibung?: string
  changed?: Date
  _rev_at?: number

  constructor(
    id: string,
    kultur_id?: string,
    file_id?: string,
    file_mime_type?: string,
    name?: string,
    beschreibung?: string,
    changed?: Date,
    _rev_at?: number,
  ) {
    this.id = id ?? uuidv1()
    this.kultur_id = kultur_id ?? null
    this.file_id = file_id ?? null
    this.file_mime_type = file_mime_type ?? null
    this.name = name ?? null
    this.beschreibung = beschreibung ?? null
    this.changed = changed ?? new window.Date().toISOString()
    this._rev_at = _rev_at ?? null
  }

  async edit({ field, value, store }) {
    // extract only the needed keys
    const {
      id,
      kultur_id,
      file_id,
      file_mime_type,
      name,
      beschreibung,
      changed,
    } = this
    const newObject = {
      id,
      kultur_id,
      file_id,
      file_mime_type,
      name,
      beschreibung,
      changed,
      [field]: value,
      _rev_at: Date.now(),
    }
    const mutation = gql`
      mutation update_kultur_file(
        $_inc: kultur_file_inc_input
        $_set: kultur_file_set_input
        $where: kultur_file_bool_exp!
      ) {
        update_kultur_file(_inc: $_inc, _set: $_set, where: $where) {
          returning {
            ...KulturFileFields
          }
        }
      }
      ${kulturFileFragment}
    `
    const variables = {
      _set: newObject,
      where: { id: { _eq: this.id } },
    }
    const response = await store.gqlClient
      .mutation(mutation, variables)
      .toPromise()
    if (response.error) {
      store.addNotification({
        message: response.error.message,
      })
      return console.log(response.error)
    }
    // updating server is done by calling code
    // optimistically update store
    const storeUpdate = {
      [field]: value,
    }
    await dexie.kultur_files.update(this.id, storeUpdate)
    return
  }

  async delete({ store }) {
    const mutation = gql`
      mutation delete_kultur_file($where: kultur_file_bool_exp!) {
        delete_kultur_file(where: $where) {
          returning {
            id
          }
        }
      }
    `
    const variables = {
      where: { id: { _eq: this.id } },
    }
    const response = await store.gqlClient
      .mutation(mutation, variables)
      .toPromise()
    if (response.error) {
      store.addNotification({
        message: response.error.message,
      })
      return console.log(response.error)
    }
    // updating server is done by calling code
    await dexie.kultur_files.delete(this.id)
  }
}

export interface ILieferungFile {
  id: string
  lieferung_id?: string
  file_id?: string
  file_mime_type?: string
  name?: string
  beschreibung?: string
  changed?: Date
  _rev_at?: number
}

export class LieferungFile implements ILieferungFile {
  id: string
  lieferung_id?: string
  file_id?: string
  file_mime_type?: string
  name?: string
  beschreibung?: string
  changed?: Date
  _rev_at?: number

  constructor(
    id: string,
    lieferung_id?: string,
    file_id?: string,
    file_mime_type?: string,
    name?: string,
    beschreibung?: string,
    changed?: Date,
    _rev_at?: number,
  ) {
    this.id = id ?? uuidv1()
    this.lieferung_id = lieferung_id ?? null
    this.file_id = file_id ?? null
    this.file_mime_type = file_mime_type ?? null
    this.name = name ?? null
    this.beschreibung = beschreibung ?? null
    this.changed = changed ?? new window.Date().toISOString()
    this._rev_at = _rev_at ?? null
  }

  async edit({ field, value, store }) {
    // extract only the needed keys
    const {
      id,
      lieferung_id,
      file_id,
      file_mime_type,
      name,
      beschreibung,
      changed,
    } = this
    const newObject = {
      id,
      lieferung_id,
      file_id,
      file_mime_type,
      name,
      beschreibung,
      changed,
      [field]: value,
      _rev_at: Date.now(),
    }
    const mutation = gql`
      mutation update_lieferung_file(
        $_inc: lieferung_file_inc_input
        $_set: lieferung_file_set_input
        $where: lieferung_file_bool_exp!
      ) {
        update_lieferung_file(_inc: $_inc, _set: $_set, where: $where) {
          returning {
            ...LieferungFileFields
          }
        }
      }
      ${lieferungFileFragment}
    `
    const variables = {
      _set: newObject,
      where: { id: { _eq: this.id } },
    }
    const response = await store.gqlClient
      .mutation(mutation, variables)
      .toPromise()
    if (response.error) {
      store.addNotification({
        message: response.error.message,
      })
      return console.log(response.error)
    }
    // updating server is done by calling code
    // optimistically update store
    const storeUpdate = {
      [field]: value,
    }
    await dexie.lieferung_files.update(this.id, storeUpdate)
    return
  }

  async delete({ store }) {
    const mutation = gql`
      mutation delete_lieferung_file($where: lieferung_file_bool_exp!) {
        delete_lieferung_file(where: $where) {
          returning {
            id
          }
        }
      }
    `
    const variables = {
      where: { id: { _eq: this.id } },
    }
    const response = await store.gqlClient
      .mutation(mutation, variables)
      .toPromise()
    if (response.error) {
      store.addNotification({
        message: response.error.message,
      })
      return console.log(response.error)
    }
    // updating server is done by calling code
    await dexie.lieferung_files.delete(this.id)
  }
}

export interface IPersonFile {
  id: string
  person_id?: string
  file_id?: string
  file_mime_type?: string
  name?: string
  beschreibung?: string
  changed?: Date
  _rev_at?: number
}

export class PersonFile implements IPersonFile {
  id: string
  person_id?: string
  file_id?: string
  file_mime_type?: string
  name?: string
  beschreibung?: string
  changed?: Date
  _rev_at?: number

  constructor(
    id: string,
    person_id?: string,
    file_id?: string,
    file_mime_type?: string,
    name?: string,
    beschreibung?: string,
    changed?: Date,
    _rev_at?: number,
  ) {
    this.id = id ?? uuidv1()
    this.person_id = person_id ?? null
    this.file_id = file_id ?? null
    this.file_mime_type = file_mime_type ?? null
    this.name = name ?? null
    this.beschreibung = beschreibung ?? null
    this.changed = changed ?? new window.Date().toISOString()
    this._rev_at = _rev_at ?? null
  }

  async edit({ field, value, store }) {
    // extract only the needed keys
    const {
      id,
      person_id,
      file_id,
      file_mime_type,
      name,
      beschreibung,
      changed,
    } = this
    const newObject = {
      id,
      person_id,
      file_id,
      file_mime_type,
      name,
      beschreibung,
      changed,
      [field]: value,
      _rev_at: Date.now(),
    }
    const mutation = gql`
      mutation update_person_file(
        $_inc: person_file_inc_input
        $_set: person_file_set_input
        $where: person_file_bool_exp!
      ) {
        update_person_file(_inc: $_inc, _set: $_set, where: $where) {
          returning {
            ...PersonFileFields
          }
        }
      }
      ${personFileFragment}
    `
    const variables = {
      _set: newObject,
      where: { id: { _eq: this.id } },
    }
    const response = await store.gqlClient
      .mutation(mutation, variables)
      .toPromise()
    if (response.error) {
      store.addNotification({
        message: response.error.message,
      })
      return console.log(response.error)
    }
    // updating server is done by calling code
    // optimistically update store
    const storeUpdate = {
      [field]: value,
    }
    await dexie.person_files.update(this.id, storeUpdate)
    return
  }

  async delete({ store }) {
    const mutation = gql`
      mutation delete_person_file($where: person_file_bool_exp!) {
        delete_person_file(where: $where) {
          returning {
            id
          }
        }
      }
    `
    const variables = {
      where: { id: { _eq: this.id } },
    }
    const response = await store.gqlClient
      .mutation(mutation, variables)
      .toPromise()
    if (response.error) {
      store.addNotification({
        message: response.error.message,
      })
      return console.log(response.error)
    }
    // updating server is done by calling code
    await dexie.person_files.delete(this.id)
  }
}

export interface ISammlungFile {
  id: string
  sammlung_id?: string
  file_id?: string
  file_mime_type?: string
  name?: string
  beschreibung?: string
  changed?: Date
  _rev_at?: number
}

export class SammlungFile implements ISammlungFile {
  id: string
  sammlung_id?: string
  file_id?: string
  file_mime_type?: string
  name?: string
  beschreibung?: string
  changed?: Date
  _rev_at?: number

  constructor(
    id: string,
    sammlung_id?: string,
    file_id?: string,
    file_mime_type?: string,
    name?: string,
    beschreibung?: string,
    changed?: Date,
    _rev_at?: number,
  ) {
    this.id = id ?? uuidv1()
    this.sammlung_id = sammlung_id ?? null
    this.file_id = file_id ?? null
    this.file_mime_type = file_mime_type ?? null
    this.name = name ?? null
    this.beschreibung = beschreibung ?? null
    this.changed = changed ?? new window.Date().toISOString()
    this._rev_at = _rev_at ?? null
  }

  async edit({ field, value, store }) {
    // extract only the needed keys
    const {
      id,
      sammlung_id,
      file_id,
      file_mime_type,
      name,
      beschreibung,
      changed,
    } = this
    const newObject = {
      id,
      sammlung_id,
      file_id,
      file_mime_type,
      name,
      beschreibung,
      changed,
      [field]: value,
      _rev_at: Date.now(),
    }
    const mutation = gql`
      mutation update_sammlung_file(
        $_inc: sammlung_file_inc_input
        $_set: sammlung_file_set_input
        $where: sammlung_file_bool_exp!
      ) {
        update_sammlung_file(_inc: $_inc, _set: $_set, where: $where) {
          returning {
            ...SammlungFileFields
          }
        }
      }
      ${sammlungFileFragment}
    `
    const variables = {
      _set: newObject,
      where: { id: { _eq: this.id } },
    }
    const response = await store.gqlClient
      .mutation(mutation, variables)
      .toPromise()
    if (response.error) {
      store.addNotification({
        message: response.error.message,
      })
      return console.log(response.error)
    }
    // updating server is done by calling code
    // optimistically update store
    const storeUpdate = {
      [field]: value,
    }
    await dexie.sammlung_files.update(this.id, storeUpdate)
    return
  }

  async delete({ store }) {
    const mutation = gql`
      mutation delete_sammlung_file($where: sammlung_file_bool_exp!) {
        delete_sammlung_file(where: $where) {
          returning {
            id
          }
        }
      }
    `
    const variables = {
      where: { id: { _eq: this.id } },
    }
    const response = await store.gqlClient
      .mutation(mutation, variables)
      .toPromise()
    if (response.error) {
      store.addNotification({
        message: response.error.message,
      })
      return console.log(response.error)
    }
    // updating server is done by calling code
    await dexie.sammlung_files.delete(this.id)
  }
}

export interface IArtQk {
  id: string
  name?: string
  titel?: string
  beschreibung?: string
  sort?: number
  changed?: Date
  changed_by?: string
  _rev?: string
  _parent_rev?: string
  _revisions?: string[]
  _depth?: number
  _deleted?: boolean
  _deleted_indexable?: number
  _conflicts?: string[]
}

export class ArtQk implements IArtQk {
  id: string
  name?: string
  titel?: string
  beschreibung?: string
  sort?: number
  changed?: Date
  changed_by?: string
  _rev?: string
  _parent_rev?: string
  _revisions?: string[]
  _depth?: number
  _deleted?: boolean
  _deleted_indexable?: number
  _conflicts?: string[]

  constructor(
    id: string,
    name?: string,
    titel?: string,
    beschreibung?: string,
    sort?: number,
    changed?: Date,
    changed_by?: string,
    _rev?: string,
    _parent_rev?: string,
    _revisions?: string[],
    _depth?: number,
    _deleted?: boolean,
    _deleted_indexable?: number,
    _conflicts?: string[],
  ) {
    this.id = id ?? uuidv1()
    this.name = name ?? null
    this.titel = titel ?? null
    this.beschreibung = beschreibung ?? null
    this.sort = sort ?? null
    this.changed = changed ?? new window.Date().toISOString()
    this.changed_by = changed_by ?? null
    this._rev = _rev ?? null
    this._parent_rev = _parent_rev ?? null
    this._revisions = _revisions ?? null
    this._depth = _depth ?? 1
    this._deleted = _deleted ?? false
    this._deleted_indexable = _deleted ? 1 : 0
    this._conflicts = _conflicts ?? null
  }

  removeConflict(_rev: string) {
    this._conflicts = this._conflicts.filter((r) => r !== _rev)
  }

  async edit({ field, value, store }) {
    const { addQueuedQuery, user, unsetError } = store

    unsetError('art_qk')
    // first build the part that will be revisioned
    const newDepth = this._depth + 1
    const newObject = {
      art_qk_id: this.id,
      name: field === 'name' ? toStringIfPossible(value) : this.name,
      titel: field === 'titel' ? toStringIfPossible(value) : this.titel,
      beschreibung:
        field === 'beschreibung'
          ? toStringIfPossible(value)
          : this.beschreibung,
      sort: field === 'sort' ? value : this.sort,
      _parent_rev: this._rev,
      _depth: newDepth,
      _deleted: field === '_deleted' ? value : this._deleted,
    }
    const rev = `${newDepth}-${md5(JSON.stringify(newObject))}`
    // DO NOT include id in rev - or revs with same data will conflict
    newObject.id = uuidv1()
    newObject._rev = rev
    // do not revision the following fields as this leads to unwanted conflicts
    newObject.changed = new window.Date().toISOString()
    newObject.changed_by = user.email
    // convert to string as hasura does not support arrays yet
    // https://github.com/hasura/graphql-engine/pull/2243
    newObject._revisions = this._revisions
      ? toPgArray([rev, ...this._revisions])
      : toPgArray([rev])
    addQueuedQuery({
      name: 'mutateInsert_art_qk_rev_one',
      variables: JSON.stringify({
        object: newObject,
        on_conflict: {
          constraint: 'art_qk_rev_pkey',
          update_columns: ['id'],
        },
      }),
      revertTable: 'art_qk',
      revertId: this.id,
      revertField: field,
      revertValue: this[field],
      newValue: value,
    })
    // optimistically update store
    const storeUpdate = {
      [field]: value,
      _depth: newObject._depth,
      _rev: newObject._rev,
      _parent_rev: newObject._parent_rev,
      changed: newObject.changed,
      changed_by: newObject.changed_by,
      _revisions: this._revisions ? [rev, ...this._revisions] : [rev],
    }
    // set all indexable boolean fields
    addIndexableBooleans({ table: 'art_qk', object: storeUpdate })

    dexie.art_qks.update(this.id, storeUpdate)
  }

  delete({ store }) {
    this.edit({ field: '_deleted', value: true, store })
  }
}

export interface IKulturOption {
  id: string
  z_bemerkungen?: boolean
  tz_teilkultur_id?: boolean
  tz_andere_menge?: boolean
  tz_auspflanzbereit_beschreibung?: boolean
  tz_bemerkungen?: boolean
  tk?: boolean
  tk_bemerkungen?: boolean
  ev_teilkultur_id?: boolean
  ev_geplant?: boolean
  ev_person_id?: boolean
  ev_datum?: boolean
  changed?: Date
  changed_by?: string
  _rev?: string
  _parent_rev?: string
  _revisions?: string[]
  _depth?: number
  _deleted?: boolean
  _deleted_indexable?: number
  _conflicts?: string[]
}

export class KulturOption implements IKulturOption {
  id: string
  z_bemerkungen?: boolean
  tz_teilkultur_id?: boolean
  tz_andere_menge?: boolean
  tz_auspflanzbereit_beschreibung?: boolean
  tz_bemerkungen?: boolean
  tk?: boolean
  tk_bemerkungen?: boolean
  ev_teilkultur_id?: boolean
  ev_geplant?: boolean
  ev_person_id?: boolean
  ev_datum?: boolean
  changed?: Date
  changed_by?: string
  _rev?: string
  _parent_rev?: string
  _revisions?: string[]
  _depth?: number
  _deleted?: boolean
  _deleted_indexable?: number
  _conflicts?: string[]

  constructor(
    id: string,
    z_bemerkungen?: boolean,
    tz_teilkultur_id?: boolean,
    tz_andere_menge?: boolean,
    tz_auspflanzbereit_beschreibung?: boolean,
    tz_bemerkungen?: boolean,
    tk?: boolean,
    tk_bemerkungen?: boolean,
    ev_teilkultur_id?: boolean,
    ev_geplant?: boolean,
    ev_person_id?: boolean,
    ev_datum?: boolean,
    changed?: Date,
    changed_by?: string,
    _rev?: string,
    _parent_rev?: string,
    _revisions?: string[],
    _depth?: number,
    _deleted?: boolean,
    _deleted_indexable?: number,
    _conflicts?: string[],
  ) {
    this.id = id ?? uuidv1()
    this.z_bemerkungen = z_bemerkungen ?? true
    this.tz_teilkultur_id = tz_teilkultur_id ?? true
    this.tz_andere_menge = tz_andere_menge ?? true
    this.tz_auspflanzbereit_beschreibung =
      tz_auspflanzbereit_beschreibung ?? true
    this.tz_bemerkungen = tz_bemerkungen ?? true
    this.tk = tk ?? false
    this.tk_bemerkungen = tk_bemerkungen ?? true
    this.ev_teilkultur_id = ev_teilkultur_id ?? true
    this.ev_geplant = ev_geplant ?? true
    this.ev_person_id = ev_person_id ?? true
    this.ev_datum = ev_datum ?? true
    this.changed = changed ?? new window.Date().toISOString()
    this.changed_by = changed_by ?? null
    this._rev = _rev ?? null
    this._parent_rev = _parent_rev ?? null
    this._revisions = _revisions ?? null
    this._depth = _depth ?? 1
    this._deleted = _deleted ?? false
    this._deleted_indexable = _deleted ? 1 : 0
    this._conflicts = _conflicts ?? null
  }

  removeConflict(_rev: string) {
    this._conflicts = this._conflicts.filter((r) => r !== _rev)
  }

  async edit({ field, value, store }) {
    const { addQueuedQuery, user, unsetError } = store

    unsetError(`kultur_option`)
    // first build the part that will be revisioned
    const newDepth = this._depth + 1
    const newObject = {
      kultur_id: this.id,
      z_bemerkungen: field === 'z_bemerkungen' ? value : this.z_bemerkungen,
      tz_teilkultur_id:
        field === 'tz_teilkultur_id' ? value : this.tz_teilkultur_id,
      tz_andere_menge:
        field === 'tz_andere_menge' ? value : this.tz_andere_menge,
      tz_auspflanzbereit_beschreibung:
        field === 'tz_auspflanzbereit_beschreibung'
          ? value
          : this.tz_auspflanzbereit_beschreibung,
      tz_bemerkungen: field === 'tz_bemerkungen' ? value : this.tz_bemerkungen,
      tk: field === 'tk' ? value : this.tk,
      tk_bemerkungen: field === 'tk_bemerkungen' ? value : this.tk_bemerkungen,
      ev_teilkultur_id:
        field === 'ev_teilkultur_id' ? value : this.ev_teilkultur_id,
      ev_geplant: field === 'ev_geplant' ? value : this.ev_geplant,
      ev_person_id: field === 'ev_person_id' ? value : this.ev_person_id,
      ev_datum: field === 'ev_datum' ? value : this.ev_datum,
      _parent_rev: this._rev,
      _depth: newDepth,
      _deleted: field === '_deleted' ? value : this._deleted,
    }
    const rev = `${newDepth}-${md5(JSON.stringify(newObject))}`
    newObject._rev = rev
    // DO NOT include id in rev - or revs with same data will conflict
    newObject.id = uuidv1()
    // do not revision the following fields as this leads to unwanted conflicts
    newObject.changed = new window.Date().toISOString()
    newObject.changed_by = user.email
    // convert to string as hasura does not support arrays yet
    // https://github.com/hasura/graphql-engine/pull/2243
    newObject._revisions = this._revisions
      ? toPgArray([rev, ...this._revisions])
      : toPgArray([rev])
    addQueuedQuery({
      name: 'mutateInsert_kultur_option_rev_one',
      variables: JSON.stringify({
        object: newObject,
        on_conflict: {
          constraint: 'kultur_option_rev_pkey',
          update_columns: ['id'],
        },
      }),
      revertTable: 'kultur_option',
      revertId: this.id,
      revertField: field,
      revertValue: this[field],
      newValue: value,
    })
    // optimistically update store
    const storeUpdate = {
      [field]: value,
      _depth: newObject._depth,
      _rev: newObject._rev,
      _parent_rev: newObject._parent_rev,
      changed: newObject.changed,
      changed_by: newObject.changed_by,
      _revisions: this._revisions ? [rev, ...this._revisions] : [rev],
    }
    // set all indexable boolean fields
    addIndexableBooleans({ table: 'kultur_option', object: storeUpdate })

    dexie.kultur_options.update(this.id, storeUpdate)
  }

  delete({ store }) {
    this.edit({ field: '_deleted', value: true, store })
  }
}

export interface IKulturQk {
  id: string
  name?: string
  titel?: string
  beschreibung?: string
  sort?: number
  changed?: Date
  changed_by?: string
  _rev?: string
  _parent_rev?: string
  _revisions?: string[]
  _depth?: number
  _deleted?: boolean
  _deleted_indexable?: number
  _conflicts?: string[]
}

export class KulturQk implements IKulturQk {
  id: string
  name?: string
  titel?: string
  beschreibung?: string
  sort?: number
  changed?: Date
  changed_by?: string
  _rev?: string
  _parent_rev?: string
  _revisions?: string[]
  _depth?: number
  _deleted?: boolean
  _deleted_indexable?: number
  _conflicts?: string[]

  constructor(
    id: string,
    name?: string,
    titel?: string,
    beschreibung?: string,
    sort?: number,
    changed?: Date,
    changed_by?: string,
    _rev?: string,
    _parent_rev?: string,
    _revisions?: string[],
    _depth?: number,
    _deleted?: boolean,
    _deleted_indexable?: number,
    _conflicts?: string[],
  ) {
    this.id = id ?? uuidv1()
    this.name = name ?? null
    this.titel = titel ?? null
    this.beschreibung = beschreibung ?? null
    this.sort = sort ?? null
    this.changed = changed ?? new window.Date().toISOString()
    this.changed_by = changed_by ?? null
    this._rev = _rev ?? null
    this._parent_rev = _parent_rev ?? null
    this._revisions = _revisions ?? null
    this._depth = _depth ?? 1
    this._deleted = _deleted ?? false
    this._deleted_indexable = _deleted ? 1 : 0
    this._conflicts = _conflicts ?? null
  }

  removeConflict(_rev: string) {
    this._conflicts = this._conflicts.filter((r) => r !== _rev)
  }

  async edit({ field, value, store }) {
    const { addQueuedQuery, user, unsetError } = store

    unsetError(`kultur_qk`)
    // first build the part that will be revisioned
    const newDepth = this._depth + 1
    const newObject = {
      kultur_qk_id: this.id,
      name: field === 'name' ? toStringIfPossible(value) : this.name,
      titel: field === 'titel' ? toStringIfPossible(value) : this.titel,
      beschreibung:
        field === 'beschreibung'
          ? toStringIfPossible(value)
          : this.beschreibung,
      sort: field === 'sort' ? value : this.sort,
      _parent_rev: this._rev,
      _depth: newDepth,
      _deleted: field === '_deleted' ? value : this._deleted,
    }
    const rev = `${newDepth}-${md5(JSON.stringify(newObject))}`
    // DO NOT include id in rev - or revs with same data will conflict
    newObject.id = uuidv1()
    newObject._rev = rev
    // do not revision the following fields as this leads to unwanted conflicts
    newObject.changed = new window.Date().toISOString()
    newObject.changed_by = user.email
    // convert to string as hasura does not support arrays yet
    // https://github.com/hasura/graphql-engine/pull/2243
    newObject._revisions = this._revisions
      ? toPgArray([rev, ...this._revisions])
      : toPgArray([rev])
    addQueuedQuery({
      name: 'mutateInsert_kultur_qk_rev_one',
      variables: JSON.stringify({
        object: newObject,
        on_conflict: {
          constraint: 'kultur_qk_rev_pkey',
          update_columns: ['id'],
        },
      }),
      revertTable: 'kultur_qk',
      revertId: this.id,
      revertField: field,
      revertValue: this[field],
      newValue: value,
    })
    // optimistically update store
    const storeUpdate = {
      [field]: value,
      _depth: newObject._depth,
      _rev: newObject._rev,
      _parent_rev: newObject._parent_rev,
      changed: newObject.changed,
      changed_by: newObject.changed_by,
      _revisions: this._revisions ? [rev, ...this._revisions] : [rev],
    }
    // set all indexable boolean fields
    addIndexableBooleans({ table: 'kultur_qk', object: storeUpdate })

    dexie.kultur_qks.update(this.id, storeUpdate)
  }

  delete({ store }) {
    this.edit({ field: '_deleted', value: true, store })
  }
}

export interface IPersonOption {
  id: string
  ar_name_deutsch?: boolean
  ga_strasse?: boolean
  ga_plz?: boolean
  ga_ort?: boolean
  ga_geom_point?: boolean
  ga_lat_lng?: boolean
  ga_aktiv?: boolean
  ga_bemerkungen?: boolean
  hk_kanton?: boolean
  hk_land?: boolean
  hk_bemerkungen?: boolean
  hk_geom_point?: boolean
  ku_zwischenlager?: boolean
  ku_erhaltungskultur?: boolean
  li_show_sl_felder?: boolean
  li_show_sl?: boolean
  sl_show_empty_when_next_to_li?: boolean
  sl_auto_copy_edits?: boolean
  tree_kultur?: boolean
  tree_teilkultur?: boolean
  tree_zaehlung?: boolean
  tree_lieferung?: boolean
  tree_event?: boolean
  art_qk_choosen?: string[]
  kultur_qk_choosen?: string[]
  changed?: Date
  changed_by?: string
  _rev?: string
  _parent_rev?: string
  _revisions?: string[]
  _depth?: number
  _deleted?: boolean
  _deleted_indexable?: number
  _conflicts?: string[]
}

export class PersonOption implements IPersonOption {
  id: string
  ar_name_deutsch?: boolean
  ga_strasse?: boolean
  ga_plz?: boolean
  ga_ort?: boolean
  ga_geom_point?: boolean
  ga_lat_lng?: boolean
  ga_aktiv?: boolean
  ga_bemerkungen?: boolean
  hk_kanton?: boolean
  hk_land?: boolean
  hk_bemerkungen?: boolean
  hk_geom_point?: boolean
  ku_zwischenlager?: boolean
  ku_erhaltungskultur?: boolean
  li_show_sl_felder?: boolean
  li_show_sl?: boolean
  sl_show_empty_when_next_to_li?: boolean
  sl_auto_copy_edits?: boolean
  tree_kultur?: boolean
  tree_teilkultur?: boolean
  tree_zaehlung?: boolean
  tree_lieferung?: boolean
  tree_event?: boolean
  art_qk_choosen?: string[]
  kultur_qk_choosen?: string[]
  changed?: Date
  changed_by?: string
  _rev?: string
  _parent_rev?: string
  _revisions?: string[]
  _depth?: number
  _deleted?: boolean
  _deleted_indexable?: number
  _conflicts?: string[]

  constructor(
    id: string,
    ar_name_deutsch?: boolean,
    ga_strasse?: boolean,
    ga_plz?: boolean,
    ga_ort?: boolean,
    ga_geom_point?: boolean,
    ga_lat_lng?: boolean,
    ga_aktiv?: boolean,
    ga_bemerkungen?: boolean,
    hk_kanton?: boolean,
    hk_land?: boolean,
    hk_bemerkungen?: boolean,
    hk_geom_point?: boolean,
    ku_zwischenlager?: boolean,
    ku_erhaltungskultur?: boolean,
    li_show_sl_felder?: boolean,
    li_show_sl?: boolean,
    sl_show_empty_when_next_to_li?: boolean,
    sl_auto_copy_edits?: boolean,
    tree_kultur?: boolean,
    tree_teilkultur?: boolean,
    tree_zaehlung?: boolean,
    tree_lieferung?: boolean,
    tree_event?: boolean,
    art_qk_choosen?: string[],
    kultur_qk_choosen?: string[],
    changed?: Date,
    changed_by?: string,
    _rev?: string,
    _parent_rev?: string,
    _revisions?: string[],
    _depth?: number,
    _deleted?: boolean,
    _deleted_indexable?: number,
    _conflicts?: string[],
  ) {
    this.id = id ?? null
    this.ar_name_deutsch = ar_name_deutsch ?? true
    this.ga_strasse = ga_strasse ?? true
    this.ga_plz = ga_plz ?? true
    this.ga_ort = ga_ort ?? true
    this.ga_geom_point = ga_geom_point ?? true
    this.ga_lat_lng = ga_lat_lng ?? true
    this.ga_aktiv = ga_aktiv ?? true
    this.ga_bemerkungen = ga_bemerkungen ?? true
    this.hk_kanton = hk_kanton ?? true
    this.hk_land = hk_land ?? true
    this.hk_bemerkungen = hk_bemerkungen ?? true
    this.hk_geom_point = hk_geom_point ?? true
    this.ku_zwischenlager = ku_zwischenlager ?? false
    this.ku_erhaltungskultur = ku_erhaltungskultur ?? false
    this.li_show_sl_felder = li_show_sl_felder ?? false
    this.li_show_sl = li_show_sl ?? true
    this.sl_show_empty_when_next_to_li = sl_show_empty_when_next_to_li ?? false
    this.sl_auto_copy_edits = sl_auto_copy_edits ?? true
    this.tree_kultur = tree_kultur ?? false
    this.tree_teilkultur = tree_teilkultur ?? false
    this.tree_zaehlung = tree_zaehlung ?? false
    this.tree_lieferung = tree_lieferung ?? false
    this.tree_event = tree_event ?? false
    this.art_qk_choosen = art_qk_choosen ?? null
    this.kultur_qk_choosen = kultur_qk_choosen ?? null
    this.changed = changed ?? new window.Date().toISOString()
    this.changed_by = changed_by ?? null
    this._rev = _rev ?? null
    this._parent_rev = _parent_rev ?? null
    this._revisions = _revisions ?? null
    this._depth = _depth ?? 1
    this._deleted = _deleted ?? false
    this._deleted_indexable = _deleted ? 1 : 0
    this._conflicts = _conflicts ?? null
  }

  removeConflict(_rev: string) {
    this._conflicts = this._conflicts.filter((r) => r !== _rev)
  }

  async edit({ field, value, store }) {
    const { addQueuedQuery, user, unsetError } = store

    unsetError(`person_option`)
    // first build the part that will be revisioned
    const newDepth = this._depth + 1
    const newObject = {
      person_id: this.id,
      ar_name_deutsch:
        field === 'ar_name_deutsch' ? value : this.ar_name_deutsch,
      ga_strasse: field === 'ga_strasse' ? value : this.ga_strasse,
      ga_plz: field === 'ga_plz' ? value : this.ga_plz,
      ga_ort: field === 'ga_ort' ? value : this.ga_ort,
      ga_geom_point: field === 'ga_geom_point' ? value : this.ga_geom_point,
      ga_lat_lng: field === 'ga_lat_lng' ? value : this.ga_lat_lng,
      ga_aktiv: field === 'ga_aktiv' ? value : this.ga_aktiv,
      ga_bemerkungen: field === 'ga_bemerkungen' ? value : this.ga_bemerkungen,
      hk_kanton: field === 'hk_kanton' ? value : this.hk_kanton,
      hk_land: field === 'hk_land' ? value : this.hk_land,
      hk_bemerkungen: field === 'hk_bemerkungen' ? value : this.hk_bemerkungen,
      hk_geom_point: field === 'hk_geom_point' ? value : this.hk_geom_point,
      ku_zwischenlager:
        field === 'ku_zwischenlager' ? value : this.ku_zwischenlager,
      ku_erhaltungskultur:
        field === 'ku_erhaltungskultur' ? value : this.ku_erhaltungskultur,
      li_show_sl_felder:
        field === 'li_show_sl_felder' ? value : this.li_show_sl_felder,
      li_show_sl: field === 'li_show_sl' ? value : this.li_show_sl,
      sl_show_empty_when_next_to_li:
        field === 'sl_show_empty_when_next_to_li'
          ? value
          : this.sl_show_empty_when_next_to_li,
      sl_auto_copy_edits:
        field === 'sl_auto_copy_edits' ? value : this.sl_auto_copy_edits,
      tree_kultur: field === 'tree_kultur' ? value : this.tree_kultur,
      tree_teilkultur:
        field === 'tree_teilkultur' ? value : this.tree_teilkultur,
      tree_zaehlung: field === 'tree_zaehlung' ? value : this.tree_zaehlung,
      tree_lieferung: field === 'tree_lieferung' ? value : this.tree_lieferung,
      tree_event: field === 'tree_event' ? value : this.tree_event,
      art_qk_choosen:
        field === 'art_qk_choosen'
          ? toPgArray(value)
          : toPgArray(this.art_qk_choosen),
      kultur_qk_choosen:
        field === 'kultur_qk_choosen'
          ? toPgArray(value)
          : toPgArray(this.kultur_qk_choosen),
      _parent_rev: this._rev,
      _depth: newDepth,
      _deleted: field === '_deleted' ? value : this._deleted,
    }
    const rev = `${newDepth}-${md5(JSON.stringify(newObject))}`
    // DO NOT include id in rev - or revs with same data will conflict
    newObject.id = uuidv1()
    newObject._rev = rev
    // do not revision the following fields as this leads to unwanted conflicts
    newObject.changed = new window.Date().toISOString()
    newObject.changed_by = user.email
    // convert to string as hasura does not support arrays yet
    // https://github.com/hasura/graphql-engine/pull/2243
    newObject._revisions = this._revisions
      ? toPgArray([rev, ...this._revisions])
      : toPgArray([rev])
    addQueuedQuery({
      name: 'mutateInsert_person_option_rev_one',
      variables: JSON.stringify({
        object: newObject,
        on_conflict: {
          constraint: 'person_option_rev_pkey',
          update_columns: ['id'],
        },
      }),
      revertTable: 'person_option',
      revertId: this.id,
      revertField: field,
      revertValue: this[field],
      newValue: value,
    })
    // optimistically update store
    const storeUpdate = {
      [field]: value,
      _depth: newObject._depth,
      _rev: newObject._rev,
      _parent_rev: newObject._parent_rev,
      changed: newObject.changed,
      changed_by: newObject.changed_by,
      _revisions: this._revisions ? [rev, ...this._revisions] : [rev],
    }
    // set all indexable boolean fields
    addIndexableBooleans({ table: 'person_option', object: storeUpdate })

    dexie.person_options.update(this.id, storeUpdate)
  }

  delete({ store }) {
    this.edit({ field: '_deleted', value: true, store })
  }
}

export interface IUserRole {
  id: string
  name?: string
  label?: string
  sort?: number
  comment?: string
  changed?: Date
}

export class UserRole implements IUserRole {
  id: string
  name?: string
  label?: string
  sort?: number
  comment?: string
  changed?: Date

  constructor(
    id: string,
    name?: string,
    label?: string,
    sort?: number,
    comment?: string,
    changed?: Date,
  ) {
    this.id = id ?? uuidv1()
    this.name = name ?? null
    this.label = label ?? null
    this.sort = sort ?? null
    this.comment = comment ?? null
    this.changed = changed ?? new window.Date().toISOString()
  }
}

// TODO: update on every change of store
export interface IStore {
  id: string // always: 'store'
  store: Record<string, unknown>
}

export interface IQueuedUpdate {
  id?: number
  time: Date
  table: string
  value: string // json of value
  revert_id?: string // only set on update, is undefined on insert
  revert_value?: string // json of previous value. Only set on update, is undefined on insert
}

// use a class to automatically set time
export class QueuedUpdate implements IQueuedUpdate {
  id?: number
  time?: Date
  table: string
  value: string
  file: Blob
  revert_id?: string
  revert_value?: string

  constructor(
    id?: number,
    time: Date,
    table: string,
    value: string,
    file: Blob,
    revert_id?: string,
    revert_value?: string,
  ) {
    if (id) this.id = id
    this.time = new Date().toISOString()
    this.table = table
    this.value = value
    this.file = file
    if (revert_id) this.revert_id = revert_id
    if (revert_value) this.revert_value = revert_value
  }
}

export class MySubClassedDexie extends Dexie {
  herkunfts!: DexieTable<Herkunft, string>
  sammlungs!: DexieTable<Sammlung, string>
  lieferungs!: DexieTable<Lieferung, string>
  arts!: DexieTable<Art, string>
  ae_arts!: DexieTable<AeArt, string>
  gartens!: DexieTable<Garten, string>
  kulturs!: DexieTable<Kultur, string>
  teilkulturs!: DexieTable<Teilkultur, string>
  zaehlungs!: DexieTable<Zaehlung, string>
  teilzaehlungs!: DexieTable<Teilzaehlung, string>
  persons!: DexieTable<Person, string>
  sammel_lieferungs!: DexieTable<SammelLieferung, string>
  events!: DexieTable<Event, string>
  avs!: DexieTable<Av, string>
  gvs!: DexieTable<Gv, string>
  art_files!: DexieTable<ArtFile, string>
  garten_files!: DexieTable<GartenFile, string>
  herkunft_files!: DexieTable<HerkunftFile, string>
  kultur_files!: DexieTable<KulturFile, string>
  lieferung_files!: DexieTable<LieferungFile, string>
  person_files!: DexieTable<PersonFile, string>
  sammlung_files!: DexieTable<SammlungFile, string>
  art_qks!: DexieTable<ArtQk, string>
  kultur_options!: DexieTable<KulturOption, string>
  kultur_qks!: DexieTable<KulturQk, string>
  person_options!: DexieTable<PersonOption, string>
  user_roles!: DexieTable<UserRole, string>
  stores!: DexieTable<IStore, string>
  queued_updates!: DexieTable<QueuedUpdate, number>

  constructor() {
    super('vermehrung')
    this.version(71).stores({
      herkunfts:
        'id, nr, _deleted_indexable, [id+_deleted_indexable], [nr+_deleted_indexable]',
      sammlungs:
        'id, *herkunft_id, *art_id, *person_id, _deleted_indexable, geplant_indexable, [art_id+herkunft_id+_deleted_indexable], [art_id+_deleted_indexable], [herkunft_id+_deleted_indexable], [person_id+_deleted_indexable], [art_id+herkunft_id], [nr+_deleted_indexable]',
      lieferungs:
        'id, *art_id, *nach_kultur_id, *von_kultur_id, *sammel_lieferung_id, *person_id, *von_sammlung_id, _deleted_indexable, nach_ausgepflanzt_indexable, geplant_indexable, [von_kultur_id+_deleted_indexable], [nach_kultur_id+_deleted_indexable], [person_id+_deleted_indexable], [art_id+_deleted_indexable], [von_sammlung_id+_deleted_indexable], [sammel_lieferung_id+_deleted_indexable], [art_id+nach_ausgepflanzt_indexable+geplant_indexable+_deleted_indexable], [von_kultur_id+geplant_indexable+_deleted_indexable], [nach_kultur_id+geplant_indexable+_deleted_indexable]',
      arts: 'id, _deleted_indexable, [id+_deleted_indexable]',
      ae_arts: 'id, name',
      gartens:
        'id, *person_id, _deleted_indexable, aktiv_indexable, [aktiv_indexable+_deleted_indexable], [person_id+aktiv_indexable+_deleted_indexable], [id+aktiv_indexable+_deleted_indexable], [person_id+aktiv_indexable]',
      kulturs:
        'id, *garten_id, *art_id, *herkunft_id, _deleted_indexable, aktiv_indexable, [art_id+aktiv_indexable+_deleted_indexable], [garten_id+aktiv_indexable+_deleted_indexable], [garten_id+_deleted_indexable], [aktiv_indexable+_deleted_indexable], [art_id+herkunft_id], [art_id+herkunft_id+aktiv_indexable+_deleted_indexable], [id+art_id+aktiv_indexable+_deleted_indexable]',
      teilkulturs:
        'id, *kultur_id, _deleted_indexable, [kultur_id+_deleted_indexable]',
      zaehlungs:
        'id, *kultur_id, datum, _deleted_indexable, prognose_indexable, [id+_deleted_indexable], [kultur_id+_deleted_indexable], [kultur_id+prognose_indexable+_deleted_indexable], [id+kultur_id+_deleted_indexable]',
      teilzaehlungs:
        'id, *zaehlung_id, *teilkultur_id, _deleted_indexable, [id+_deleted_indexable], [zaehlung_id+_deleted_indexable], [teilkultur_id+_deleted_indexable]',
      persons:
        'id, &account_id, aktiv, _deleted_indexable, aktiv_indexable, [aktiv_indexable+_deleted_indexable], [nr+aktiv_indexable+_deleted_indexable]',
      sammel_lieferungs:
        'id, *art_id, *nach_kultur_id, *von_kultur_id, *person_id, *von_sammlung_id, _deleted_indexable, nach_ausgepflanzt_indexable, geplant_indexable',
      events:
        'id, *kultur_id, *teilkultur_id, _deleted_indexable, geplant_indexable, [kultur_id+_deleted_indexable], [teilkultur_id+_deleted_indexable]',
      avs: 'id, *art_id, *person_id, _deleted_indexable, [person_id+_deleted_indexable]',
      gvs: 'id, *garten_id, *person_id, _deleted_indexable, [person_id+_deleted_indexable]',
      art_files: 'id, name',
      garten_files: 'id, name',
      herkunft_files: 'id, name',
      kultur_files: 'id, name',
      lieferung_files: 'id, name',
      person_files: 'id, name',
      sammlung_files: 'id, name',
      art_qks: 'id, name, _deleted_indexable',
      kultur_options: 'id, _deleted_indexable',
      kultur_qks: 'id, _deleted_indexable',
      person_options: 'id, _deleted_indexable',
      user_roles: 'id',
      stores: 'id',
      queued_updates: '++id',
    })
    this.herkunfts.mapToClass(Herkunft)
    this.sammlungs.mapToClass(Sammlung)
    this.lieferungs.mapToClass(Lieferung)
    this.arts.mapToClass(Art)
    this.ae_arts.mapToClass(AeArt)
    this.gartens.mapToClass(Garten)
    this.kulturs.mapToClass(Kultur)
    this.teilkulturs.mapToClass(Teilkultur)
    this.zaehlungs.mapToClass(Zaehlung)
    this.teilzaehlungs.mapToClass(Teilzaehlung)
    this.persons.mapToClass(Person)
    this.sammel_lieferungs.mapToClass(SammelLieferung)
    this.events.mapToClass(Event)
    this.avs.mapToClass(Av)
    this.gvs.mapToClass(Gv)
    this.art_files.mapToClass(ArtFile)
    this.garten_files.mapToClass(GartenFile)
    this.herkunft_files.mapToClass(HerkunftFile)
    this.kultur_files.mapToClass(KulturFile)
    this.lieferung_files.mapToClass(LieferungFile)
    this.person_files.mapToClass(PersonFile)
    this.sammlung_files.mapToClass(SammlungFile)
    this.art_qks.mapToClass(ArtQk)
    this.kultur_options.mapToClass(KulturOption)
    this.kultur_qks.mapToClass(KulturQk)
    this.person_options.mapToClass(PersonOption)
    this.user_roles.mapToClass(UserRole)
  }
}

export const dexie = new MySubClassedDexie()
