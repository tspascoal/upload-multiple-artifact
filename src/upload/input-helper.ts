import * as core from '@actions/core'
import { Inputs, NoFileOptions } from './constants'
import { UploadInputs } from './upload-inputs'

/**
 * Helper to get all the inputs for the action
 */
export function getInputs(): UploadInputs {
  let name : string | string [] = core.getInput(Inputs.Name)
  let path : string | string [] = core.getInput(Inputs.Path, { required: true })
  const overwrite = core.getBooleanInput(Inputs.Overwrite)

  const ifNoFilesFound = core.getInput(Inputs.IfNoFilesFound)
  const noFileBehavior: NoFileOptions = NoFileOptions[ifNoFilesFound]

  if (!noFileBehavior) {
    core.setFailed(
      `Unrecognized ${Inputs.IfNoFilesFound
      } input. Provided: ${ifNoFilesFound}. Available options: ${Object.keys(
        NoFileOptions
      )}`
    )
  }

  try {
    const nameJSON = JSON.parse(name as string)
    if (Array.isArray(nameJSON)) {
      core.debug('Multiple artifacts will be uploaded')
      name = nameJSON
    }

    try {
      const pathJSON = JSON.parse(path as string)
      if (Array.isArray(pathJSON)) {
        core.debug('Multiple paths will be uploaded')
        path = pathJSON
      }
    } catch (e) {
      core.setFailed('Path is not a valid JSON array')
    }

    //TODO: array elements inside each element should be joined into a single line with linefeeds? 

    if (name.length !== path.length) {
      core.setFailed('Number of artifacts and paths do not match')
    }
  } catch (e) {
    // name is not JSON array
  }

  const inputs = {
    artifactName: name,
    searchPath: path,
    ifNoFilesFound: noFileBehavior,
    overwrite: overwrite
  } as UploadInputs

  const retentionDaysStr = core.getInput(Inputs.RetentionDays)
  if (retentionDaysStr) {
    inputs.retentionDays = parseInt(retentionDaysStr)
    if (isNaN(inputs.retentionDays)) {
      core.setFailed('Invalid retention-days')
    }
  }

  const compressionLevelStr = core.getInput(Inputs.CompressionLevel)
  if (compressionLevelStr) {
    inputs.compressionLevel = parseInt(compressionLevelStr)
    if (isNaN(inputs.compressionLevel)) {
      core.setFailed('Invalid compression-level')
    }

    if (inputs.compressionLevel < 0 || inputs.compressionLevel > 9) {
      core.setFailed('Invalid compression-level. Valid values are 0-9')
    }
  }

  return inputs
}
