import { router } from '~/server/trpc/trpc'
import { protectedProcedure } from '~/server/trpc/trpc'
import { z } from 'zod'
import { toDataURL } from 'qrcode'
import { randomUUID } from 'crypto'
import { LogType } from '@prisma/client'
import { ErrorTitle } from '../../constants/ErrorTitle'
import { TRPCError } from '@trpc/server'

const createEvent = protectedProcedure
  .input(
    z.object({
      name: z.string(),
      startDate: z.date(),
      endDate: z.date(),
      departments: z.array(z.string()),
      attendees: z.array(z.string()),
      isQrRequired: z.boolean(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    try {
      let qr_code: string | undefined
      const id = randomUUID()

      if (input.isQrRequired) {
        qr_code = await toDataURL(id)
      }

      await ctx.prisma.event.create({
        data: {
          attendees: {
            connect: input.attendees.map((attendee) => {
              return { id: attendee }
            }),
          },
          id,
          name: input.name,
          startDate: input.startDate,
          endDate: input.endDate,
          qr_code,
        },
      })
    } catch (e) {
      await ctx.prisma.log.create({
        data: {
          message: (e as Error).message,
          title: ErrorTitle.ERROR_CREATING_EVENT,
          type: LogType.ERROR,
        },
      })
    }
  })

const getAllUsers = protectedProcedure.query(async ({ ctx }) => {
  try {
    const users = await ctx.prisma.user.findMany({
      select: {
        department: true,
        roles: true,
        name: true,
        id: true,
      },
    })
    return users
  } catch (e) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: (e as Error).message,
    })
  }
})

const getEventInfo = protectedProcedure
  .input(z.string())
  .query(async ({ ctx, input }) => {
    try {
      return await ctx.prisma.event.findUnique({
        where: { id: input },
        select: {
          attendees: {
            select: { name: true, department: true, roles: true, id: true },
          },
          _count: { select: { Attendance: true, attendees: true } },
          endDate: true,
          id: true,
          hasStarted: true,
          name: true,
          qr_code: true,
          startDate: true,
        },
      })
    } catch (e) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: (e as Error).message,
      })
    }
  })

export const eventRouter = router({
  createEvent,
  getAllUsers,
  getEventInfo,
})
