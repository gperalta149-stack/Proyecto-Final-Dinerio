import React, { useState, useEffect } from 'react';
import { MonthSelector } from '../components/calendar/MonthSelector';
import { CalendarView } from '../components/calendar/CalendarView';
import { getCalendarEvents } from '../services/calendarService';
import type { CalendarEvent } from '../types';


export const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'month' | 'list'>('month');

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const monthEvents = await getCalendarEvents(
        currentDate.getMonth() + 1,
        currentDate.getFullYear()
      );
      setEvents(monthEvents);
      
      console.log('📅 Eventos cargados en CalendarPage:', monthEvents);
    } catch (error) {
      console.error('Error loading calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentMonthEvents = events.filter((event: CalendarEvent) => {
    const eventDate = new Date(event.date);
    return eventDate.getMonth() === currentDate.getMonth() && 
            eventDate.getFullYear() === currentDate.getFullYear();
  });

  const todayEvents = events.filter((event: CalendarEvent) => {
    const today = new Date();
    const eventDate = new Date(event.date);
    return eventDate.toDateString() === today.toDateString();
  });

  const upcomingEvents = events
    .filter((event: CalendarEvent) => {
      const eventDate = new Date(event.date);
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      return eventDate >= today && eventDate <= nextWeek;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const stats = {
    total: currentMonthEvents.length,
    paid: currentMonthEvents.filter((e: CalendarEvent) => e.status === 'paid').length,
    pending: currentMonthEvents.filter((e: CalendarEvent) => e.status === 'pending').length,
    cancelled: currentMonthEvents.filter((e: CalendarEvent) => e.status === 'cancelled').length,
    totalAmount: currentMonthEvents
      .filter((e: CalendarEvent) => e.status === 'pending')
      .reduce((sum: number, event: CalendarEvent) => sum + Number(event.amount), 0)
  };

  if (loading) {
    return (
      <div className="subtrack-page">
        <div className="subtrack-container">
          <div className="subtrack-loading">
            <div className="loading-spinner mx-auto"></div>
            <p className="text-gray-400 mt-4">Cargando calendario...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="subtrack-page">
      <div className="subtrack-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Calendario de Pagos</h1>
            <p className="page-subtitle">
              Gestiona y visualiza todos tus pagos de suscripciones
              {currentMonthEvents.length > 0 && ` • ${currentMonthEvents.length} pagos este mes`}
            </p>
          </div>
          <div className="page-actions">
            <div className="flex gap-3">
              <button
                onClick={() => setView('month')}
                className={`subtrack-btn ${view === 'month' ? 'subtrack-btn-primary' : 'subtrack-btn-secondary'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Vista Mes
              </button>
              <button
                onClick={() => setView('list')}
                className={`subtrack-btn ${view === 'list' ? 'subtrack-btn-primary' : 'subtrack-btn-secondary'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Vista Lista
              </button>
            </div>
          </div>
        </div>

        {/* Selector de Mes */}
        <div className="subtrack-card mb-6">
          <MonthSelector
            currentDate={currentDate}
            onDateChange={setCurrentDate}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Calendario Principal */}
          <div className="lg:col-span-3">
            {view === 'month' ? (
              <CalendarView currentDate={currentDate} />
            ) : (
              <div className="subtrack-card">
                <h2 className="text-xl font-semibold text-white mb-6">
                  Lista de Pagos - {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </h2>
                
                {currentMonthEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No hay pagos este mes</h3>
                    <p className="text-gray-400">
                      No se encontraron pagos programados para {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentMonthEvents
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((event: CalendarEvent, index: number) => (
                        <div
                          key={`${event.id}-${index}`}
                          className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/30 hover:border-indigo-500/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: event.categoryColor || '#667eea' }}
                            ></div>
                            <div>
                              <h3 className="font-semibold text-white">{event.title}</h3>
                              <p className="text-gray-400 text-sm">
                                {new Date(event.date).toLocaleDateString('es-ES', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6">
                            <span className="text-lg font-bold text-white">
                              {new Intl.NumberFormat('es-AR', {
                                style: 'currency',
                                currency: event.currency
                              }).format(event.amount)}
                            </span>
                            
                            <span className={`status-badge ${
                              event.status === 'paid' ? 'status-active' :
                              event.status === 'pending' ? 'status-paused' : 'status-cancelled'
                            }`}>
                              {event.status === 'paid' ? 'Pagado' :
                                event.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                            </span>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Resumen del Mes */}
            <div className="subtrack-card">
              <h3 className="text-lg font-semibold text-white mb-4">📊 Resumen del Mes</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                  <span className="text-gray-300">Total de pagos</span>
                  <span className="text-white font-semibold text-lg">{stats.total}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
                  <span className="text-gray-300">Pagados</span>
                  <span className="text-green-400 font-semibold">{stats.paid}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-500/10 rounded-lg">
                  <span className="text-gray-300">Pendientes</span>
                  <span className="text-orange-400 font-semibold">{stats.pending}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg">
                  <span className="text-gray-300">Cancelados</span>
                  <span className="text-red-400 font-semibold">{stats.cancelled}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg">
                  <span className="text-gray-300">Monto pendiente</span>
                  <span className="text-blue-400 font-semibold">
                    {new Intl.NumberFormat('es-AR', {
                      style: 'currency',
                      currency: 'ARS'
                    }).format(stats.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Pagos de Hoy */}
            {todayEvents.length > 0 && (
              <div className="subtrack-card bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
                <h3 className="text-lg font-semibold text-white mb-3">
                  {todayEvents.some((e: CalendarEvent) => e.status === 'pending') ? '⚠️ Pagos de Hoy' : '✅ Pagos de Hoy'}
                </h3>
                <div className="space-y-2">
                  {todayEvents.map((event: CalendarEvent, index: number) => (
                    <div key={index} className={`flex justify-between items-center p-2 rounded ${
                      event.status === 'pending' ? 'bg-orange-500/5' : 'bg-green-500/5'
                    }`}>
                      <span className="text-white text-sm font-medium">{event.title}</span>
                      <span className={`font-bold ${
                        event.status === 'pending' ? 'text-orange-300' : 'text-green-300'
                      }`}>
                        {new Intl.NumberFormat('es-AR', {
                          style: 'currency',
                          currency: event.currency
                        }).format(event.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Próximos Pagos */}
            <div className="subtrack-card">
              <h3 className="text-lg font-semibold text-white mb-3">📅 Próximos 7 Días</h3>
              {upcomingEvents.length === 0 ? (
                <p className="text-gray-400 text-sm">No hay pagos programados para la próxima semana.</p>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.slice(0, 5).map((event: CalendarEvent, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-700/30 rounded transition-colors">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: event.categoryColor || '#667eea' }}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{event.title}</p>
                        <p className="text-gray-400 text-xs">
                          {new Date(event.date).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </p>
                      </div>
                      <span className="text-white text-sm font-bold">
                        {new Intl.NumberFormat('es-AR', {
                          style: 'currency',
                          currency: event.currency
                        }).format(event.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};