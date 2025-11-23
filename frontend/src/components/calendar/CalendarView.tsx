import React, { useEffect, useState } from 'react';
import { getCalendarEvents } from '../../services/calendarService';
import type { CalendarEvent } from '../../types';
import { PaymentEvent } from './PaymentEvent';

interface CalendarViewProps {
    currentDate: Date;
}

const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};

export const CalendarView: React.FC<CalendarViewProps> = ({ currentDate }) => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    useEffect(() => {
        console.log('[CALENDARVIEW] currentDate cambió:', currentDate);
        loadEvents();
        setSelectedDay(null);
    }, [currentDate]);

    const loadEvents = async () => {
        try {
            setLoading(true);
            console.log('[CALENDARVIEW] Cargando eventos para:', {
                month: currentDate.getMonth() + 1,
                year: currentDate.getFullYear()
            });
            
            const monthEvents = await getCalendarEvents(
                currentDate.getMonth() + 1,
                currentDate.getFullYear()
            );
            
            console.log('[CALENDARVIEW] Eventos cargados:', monthEvents);
            setEvents(monthEvents);
        } catch (error) {
            console.error('[CALENDARVIEW] Error loading calendar events:', error);
        } finally {
            setLoading(false);
        }
    };

    const getEventsForDay = (day: number, isCurrentMonth: boolean = true) => {
        if (!isCurrentMonth) return [];

        const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dateStr = dayDate.toISOString().split('T')[0];

        const dayEvents = events.filter(event => {
            const eventDate = new Date(event.date);
            const eventDateStr = eventDate.toISOString().split('T')[0];
            return eventDateStr === dateStr;
        });
        
        console.log(`Día ${day}: ${dayEvents.length} eventos`, dayEvents);
        return dayEvents;
    };

    const handleDayClick = (day: number, isCurrentMonth: boolean) => {
        if (!isCurrentMonth) return;
        setSelectedDay(day === selectedDay ? null : day);
        console.log(`Día seleccionado: ${day}`, getEventsForDay(day, true));
    };

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const daysInPrevMonth = getDaysInPrevMonth(prevMonth);
    
    for (let i = 0; i < firstDay; i++) {
        days.push({
            day: daysInPrevMonth - firstDay + i + 1,
            isCurrentMonth: false,
            isPrevMonth: true
        });
    }

    for (let day = 1; day <= daysInMonth; day++) {
        days.push({
            day,
            isCurrentMonth: true,
            isPrevMonth: false
        });
    }

    const totalDays = days.length;
    const remainingDays = 42 - totalDays;
    for (let day = 1; day <= remainingDays; day++) {
        days.push({
            day,
            isCurrentMonth: false,
            isPrevMonth: false
        });
    }

    const handleEventClick = (event: CalendarEvent) => {
        console.log('Evento clickeado:', event);
    };

    const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    const overduePayments = events.filter(event => {
        const eventDate = new Date(event.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return eventDate < today && event.status === 'pending';
    }).length;

    const paidPayments = events.filter(event => event.status === 'paid').length;

    if (loading) {
        return (
            <div className="calendar-loading">
                <div className="loading-spinner"></div>
                <p>Cargando eventos del calendario...</p>
            </div>
        );
    }

    return (
        <div className="calendar-container">
            {/*ENCABEZADO CON MES Y AÑO */}
            <div className="calendar-header">
                <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
            </div>

            {/*ESTADÍSTICAS DEL MES - TRES COLUMNAS */}
            <div className="calendar-stats">
                <div className="stat-item total-month">
                    <span className="stat-label">Total del mes:</span>
                    <span className="stat-value">
                        ${events.reduce((total, event) => total + Number(event.amount), 0).toFixed(2)}
                    </span>
                </div>
                <div className="stat-item active-payments">
                    <span className="stat-label">Pagos realizados:</span>
                    <span className="stat-value">
                        {paidPayments} {/*CORREGIDO: usar paidPayments */}
                    </span>
                </div>
                <div className="stat-item overdue-payments">
                    <span className="stat-label">Pagos atrasados:</span>
                    <span className="stat-value">
                        {overduePayments}
                    </span>
                </div>
            </div>

            {/*DÍAS DE LA SEMANA */}
            <div className="calendar-weekdays">
                {dayNames.map(day => (
                    <div key={day} className="weekday">
                        {day}
                    </div>
                ))}
            </div>

            {/*GRID DEL CALENDARIO - CORREGIDO */}
            <div className="calendar-grid">
                {days.map((dayObj, index) => {
                    const { day, isCurrentMonth } = dayObj;
                    const isToday = isCurrentMonth &&
                                    day === new Date().getDate() &&
                                    currentDate.getMonth() === new Date().getMonth() &&
                                    currentDate.getFullYear() === new Date().getFullYear();
                    
                    const isSelected = isCurrentMonth && day === selectedDay;
                    const dayEvents = getEventsForDay(day, isCurrentMonth);

                    return (
                        <div
                            key={index}
                            className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${dayEvents.length > 0 ? 'has-events' : ''}`}
                            onClick={() => handleDayClick(day, isCurrentMonth)}
                        >
                            <div className="day-number">
                                {day}
                                {dayEvents.length > 0 && (
                                    <span className="event-dot"></span>
                                )}
                            </div>
                            
                            {isCurrentMonth && dayEvents.length > 0 && (
                                <div className="day-events">
                                    {dayEvents.slice(0, 2).map((event, eventIndex) => (
                                    <PaymentEvent
                                        key={`${event.id}-${eventIndex}`}
                                        event={event}
                                        onClick={() => handleEventClick(event)}
                                        compact={true}
                                    />
                                    ))}
                                    
                                    {dayEvents.length > 2 && (
                                    <div className="more-events">
                                        +{dayEvents.length - 2} más
                                    </div>
                                    )}
                                </div>
                                )}
                        </div>
                    );
                })}
            </div>

            {/*LEYENDA */}
            <div className="calendar-legend">
                <div className="legend-item">
                    <div className="legend-color today"></div>
                    <span>Hoy</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color has-events"></div>
                    <span>Con pagos</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color selected"></div>
                    <span>Seleccionado</span>
                </div>
            </div>
        </div>
    );
};

const getDaysInPrevMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};