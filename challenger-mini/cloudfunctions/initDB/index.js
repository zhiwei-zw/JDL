{
  "challenges": {
    "field": {
      "_id": "String",
      "title": "String",
      "desc": "String",
      "icon": "String",
      "dailyLimit": "Number",
      "creatorId": "String",
      "joinCount": "Number",
      "maxMembers": "Number",
      "isPublic": "Boolean",
      "status": "String",
      "createTime": "Date",
      "updateTime": "Date"
    }
  },
  "checkins": {
    "field": {
      "_id": "String",
      "challengeId": "String",
      "userId": "String",
      "nickname": "String",
      "avatarUrl": "String",
      "days": "Number",
      "createTime": "Date"
    }
  },
  "user_challenges": {
    "field": {
      "_id": "String",
      "userId": "String",
      "challengeId": "String",
      "nickname": "String",
      "avatarUrl": "String",
      "currentDay": "Number",
      "totalDays": "Number",
      "isCreator": "Boolean",
      "status": "String",
      "createTime": "Date",
      "lastCheckinTime": "Date"
    }
  }
}
