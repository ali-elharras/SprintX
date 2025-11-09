const Event = require('../models/Event');
const Registration = require('../models/Registration');

/**
 * GET /api/reports/attendees
 * Query: eventName, eventType, startDate, endDate
 */
exports.getAttendeeReport = async (req, res, next) => {
  try {
    const { eventName, eventType, startDate, endDate } = req.query;
    const eventMatch = {};

    if (eventName) {
      eventMatch.$or = [
        { title: { $regex: new RegExp(eventName, 'i') } },
        { name: { $regex: new RegExp(eventName, 'i') } }
      ];
    }
    if (eventType) {
      eventMatch.type = eventType;
    }
    if (startDate || endDate) {
      eventMatch.startDate = {};
      if (startDate) eventMatch.startDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        eventMatch.startDate.$lte = end;
      }
    }

    const pipeline = [
      { $match: eventMatch },
      {
        $lookup: {
          from: 'registrations',
          localField: '_id',
          foreignField: 'event',
          as: 'registrations'
        }
      },
      {
        $project: {
          _id: 1,
          name: { $ifNull: ['$title', '$name'] },
          type: 1,
          date: '$startDate',
          attendeeCount: { $size: '$registrations' }
        }
      },
      { $sort: { date: -1 } }
    ];

    const results = await Event.aggregate(pipeline);
    res.json({ data: results });
  } catch (e) {
    next(e);
  }
};

/**
 * GET /api/reports/sales
 * Query: eventType, startDate, endDate, sort=asc|desc
 * Revenue Strategy:
 *   1) Sum registration.fee if present.
 *   2) Fallback: attendeeCount * event.cost (if event.cost exists).
 */
exports.getSalesReport = async (req, res, next) => {
  try {
    const { eventType, startDate, endDate, sort } = req.query;
    const eventMatch = {};
    if (eventType) eventMatch.type = eventType;
    if (startDate || endDate) {
      eventMatch.startDate = {};
      if (startDate) eventMatch.startDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        eventMatch.startDate.$lte = end;
      }
    }

    const pipeline = [
      { $match: eventMatch },
      {
        $lookup: {
          from: 'registrations',
          localField: '_id',
          foreignField: 'event',
          as: 'registrations'
        }
      },
      {
        $addFields: {
          attendeeCount: { $size: '$registrations' },
          regFees: {
            $map: {
              input: '$registrations',
              as: 'r',
              in: {
                $ifNull: ['$$r.fee', null]
              }
            }
          }
        }
      },
      {
        $addFields: {
          sumRegFees: {
            $sum: {
              $filter: {
                input: '$regFees',
                as: 'f',
                cond: { $ne: ['$$f', null] }
              }
            }
          }
        }
      },
      {
        $addFields: {
          revenue: {
            $cond: [
              { $gt: ['$sumRegFees', 0] },
              '$sumRegFees',
              {
                $cond: [
                  { $and: [{ $ne: ['$cost', null] }, { $gt: ['$attendeeCount', 0] }] },
                  { $multiply: ['$cost', '$attendeeCount'] },
                  0
                ]
              }
            ]
          }
        }
      },
      {
        $project: {
          _id: 1,
          name: { $ifNull: ['$title', '$name'] },
          type: 1,
          date: '$startDate',
          attendeeCount: 1,
          revenue: 1
        }
      }
    ];

    if (sort === 'asc') {
      pipeline.push({ $sort: { revenue: 1 } });
    } else if (sort === 'desc') {
      pipeline.push({ $sort: { revenue: -1 } });
    } else {
      pipeline.push({ $sort: { date: -1 } });
    }

    const results = await Event.aggregate(pipeline);
    res.json({ data: results });
  } catch (e) {
    next(e);
  }
};