'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import socketUrl from '@/config/socketUrl'; // ✅ Use dedicated socket URL
import { SocketUser } from '@/types';
import { apiSlice } from '@/redux/features/api/apiSlice';
import {
	playNotificationSound,
	unlockNotifySoundOnUserGesture,
} from '@/lib/notifySound';

interface iSocketContextType {
	socket: Socket | null;
	isSocketConnected: boolean;
	onlineUsers: SocketUser[]; // Optional
}

export const SocketContext = createContext<iSocketContextType | null>(null);

export const SocketContextProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const { user } = useSelector((state: any) => state.auth);
	const [socket, setSocket] = useState<Socket | null>(null);
	const [isSocketConnected, setIsSocketConnected] = useState(false);
	const [onlineUsers, setOnlineUsers] = useState<SocketUser[]>([]);
	const dispatch = useDispatch();

	// পেজে প্রথম ক্লিক/কী-প্রেসে সাউন্ড আনলক করে রাখা (browser autoplay policy)
	useEffect(() => {
		unlockNotifySoundOnUserGesture();
	}, []);

	useEffect(() => {
		if (!user || !user._id) return;

		// ✅ No token passed
		const newSocket = io(socketUrl, {
			transports: ['websocket'],
		});

		newSocket.on('connect', () => {
			console.log('✅ Socket connected:', newSocket.id);
			newSocket.emit('join-room', user._id); // Join user's room
			setSocket(newSocket);
			setIsSocketConnected(true);
		});

		newSocket.on('disconnect', () => {
			console.log('🔴 Socket disconnected');
			setIsSocketConnected(false);
		});

		return () => {
			newSocket.disconnect();
			setSocket(null);
			setIsSocketConnected(false);
		};
	}, [user?._id]);

	useEffect(() => {
		if (!socket) return;

		socket.on('getUsers', (users: SocketUser[]) => {
			setOnlineUsers(users);
		});

		// ── নতুন এডমিন নোটিফিকেশন এলে: সাউন্ড + লিস্ট/ব্যাজ রিফ্রেশ ──
		// (অ্যাডমিন প্যানেল খোলা/অনলাইনে থাকা অবস্থাতেই এটা আসে;
		//  অফলাইনে থাকলে ব্যাকএন্ড এর বদলে web push পাঠায়)
		const onAdminNotification = () => {
			playNotificationSound();
			dispatch(apiSlice.util.invalidateTags(['AdminNotifications']));
		};
		socket.on('admin-notification', onAdminNotification);

		// ── অ্যাডমিন নিজেও একজন ইউজার — তার নিজের ব্যক্তিগত নোটিফিকেশন
		// (deposit/withdraw/kyc ইত্যাদি) এলেও সাউন্ড বাজানো হয়।
		const onUserNotification = () => {
			playNotificationSound();
			dispatch(
				apiSlice.util.invalidateTags([
					'MyUnreadNotifications',
					'MyUnreadNotificationsCount',
				]),
			);
		};
		socket.on('notifications:new', onUserNotification);
		socket.on('user-notification', onUserNotification);

		return () => {
			socket.off('getUsers');
			socket.off('admin-notification', onAdminNotification);
			socket.off('notifications:new', onUserNotification);
			socket.off('user-notification', onUserNotification);
		};
	}, [socket, dispatch]);

	return (
		<SocketContext.Provider value={{ socket, isSocketConnected, onlineUsers }}>
			{children}
		</SocketContext.Provider>
	);
};

export const useSocket = () => {
	const context = useContext(SocketContext);
	if (!context) {
		throw new Error('useSocket must be used within a SocketProvider');
	}
	return context;
};
