import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { google } from "googleapis";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const session = await auth();

        if (!session?.accessToken) {
            return NextResponse.json(
                { error: "Not authenticated. Please sign in with Google." },
                { status: 401 }
            );
        }

        // Create OAuth2 client with the access token
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({
            access_token: session.accessToken,
        });

        // Create Calendar API client
        const calendar = google.calendar({ version: "v3", auth: oauth2Client });

        // Get events from the primary calendar
        const now = new Date();
        const oneWeekLater = new Date();
        oneWeekLater.setDate(now.getDate() + 7);

        const response = await calendar.events.list({
            calendarId: "primary",
            timeMin: now.toISOString(),
            timeMax: oneWeekLater.toISOString(),
            maxResults: 50,
            singleEvents: true,
            orderBy: "startTime",
        });

        const events = response.data.items || [];

        // Transform events to our format
        const calendarEvents = events.map((event) => ({
            id: event.id || `event-${Date.now()}`,
            title: event.summary || "Untitled Event",
            start: event.start?.dateTime || event.start?.date || now.toISOString(),
            end: event.end?.dateTime || event.end?.date || now.toISOString(),
            type: "meeting" as const,
            source: "google" as const,
            color: event.colorId ? `#${event.colorId}` : "#4285f4",
        }));

        // Save events to database if user is authenticated
        if (session.user?.email) {
            const user = await prisma.user.findUnique({
                where: { email: session.user.email },
            });

            if (user) {
                // Clear old Google events for this user
                await prisma.calendarEvent.deleteMany({
                    where: { userId: user.id, source: "google" },
                });

                // Save new events
                for (const event of calendarEvents) {
                    await prisma.calendarEvent.create({
                        data: {
                            userId: user.id,
                            externalId: event.id,
                            title: event.title,
                            start: new Date(event.start),
                            end: new Date(event.end),
                            type: event.type,
                            source: event.source,
                            color: event.color,
                        },
                    });
                }
            }
        }

        return NextResponse.json({
            success: true,
            events: calendarEvents,
            count: calendarEvents.length,
            message: `Synced ${calendarEvents.length} events from Google Calendar`,
        });
    } catch (error) {
        console.error("Error fetching calendar events:", error);

        // Check for specific OAuth errors
        if (error instanceof Error) {
            if (error.message.includes("invalid_grant") || error.message.includes("Token has been expired")) {
                return NextResponse.json(
                    { error: "Calendar access expired. Please sign in again." },
                    { status: 401 }
                );
            }
        }

        return NextResponse.json(
            { error: "Failed to fetch calendar events", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
