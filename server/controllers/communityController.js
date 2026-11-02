import * as communityService from '../services/communityService.js'
import { sendData } from '../utils/response.js'

export function listCommunities(_req, res) {
  return sendData(res, communityService.listCommunities())
}

export function getCommunity(req, res) {
  return sendData(res, communityService.getCommunity(req.params.communityId))
}

export function createCommunity(req, res) {
  const community = communityService.createCommunity(req.body, req.auth.userId)
  return sendData(res, community, 201)
}

export function joinCommunity(req, res) {
  return sendData(res, communityService.joinCommunity(req.params.communityId, req.auth.userId))
}

export function leaveCommunity(req, res) {
  return sendData(res, communityService.leaveCommunity(req.params.communityId, req.auth.userId))
}
