import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import { auth, db } from "./firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import {
  collection, getDocs, addDoc, deleteDoc, doc
} from "firebase/firestore";

export default function MyOKRApp() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [okrs, setOkrs] = useState([]);
  const [newOKR, setNewOKR] = useState("");
  const [newComment, setNewComment] = useState("");
  const [newProgress, setNewProgress] = useState(0);
  const [team, setTeam] = useState("Engineering");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) loadOKRs();
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const loadOKRs = async () => {
    const snapshot = await getDocs(collection(db, "okrs"));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setOkrs(data);
  };

  const addOKR = async () => {
    if (newOKR.trim()) {
      const docRef = await addDoc(collection(db, "okrs"), {
        title: newOKR,
        comment: newComment,
        progress: newProgress,
        team,
        user: user.email
      });
      setOkrs([...okrs, {
        id: docRef.id,
        title: newOKR,
        comment: newComment,
        progress: newProgress,
        team,
        user: user.email
      }]);
      setNewOKR("");
      setNewComment("");
      setNewProgress(0);
    }
  };

  const deleteOKR = async (id) => {
    await deleteDoc(doc(db, "okrs", id));
    setOkrs(okrs.filter((okr) => okr.id !== id));
  };

  const chartData = okrs.map((okr) => ({ name: okr.title, Progress: okr.progress }));

  if (!user) {
    return (
      <main className="p-6 max-w-md mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Login to MyOKR</h1>
        <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button onClick={login}>Login</Button>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">MyOKR Dashboard</h1>
        <Button variant="outline" onClick={logout}>Logout</Button>
      </div>

      <Tabs defaultValue="user" className="mb-4">
        <TabsList>
          <TabsTrigger value="team">Team OKRs</TabsTrigger>
          <TabsTrigger value="user">My OKRs</TabsTrigger>
          <TabsTrigger value="dashboard">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="team">
          {okrs
            .filter((okr) => okr.team === team && okr.user !== user.email)
            .map((okr) => (
              <Card key={okr.id} className="mb-2">
                <CardContent className="p-4">
                  <h2 className="font-semibold">{okr.title}</h2>
                  <Progress value={okr.progress} className="my-2" />
                  <p className="text-xs italic">{okr.comment}</p>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="user">
          <div className="space-y-4">
            {okrs
              .filter((okr) => okr.user === user.email)
              .map((okr) => (
                <Card key={okr.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between">
                      <div>
                        <h2 className="font-semibold">{okr.title}</h2>
                        <Progress value={okr.progress} className="my-2" />
                        <p className="text-xs italic text-muted-foreground">Comment: {okr.comment}</p>
                      </div>
                      <Button variant="outline" onClick={() => deleteOKR(okr.id)}>Delete</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <Input placeholder="New OKR title" value={newOKR} onChange={(e) => setNewOKR(e.target.value)} />
              <Input type="number" placeholder="Progress %" value={newProgress} onChange={(e) => setNewProgress(Number(e.target.value))} />
              <Input placeholder="Comment" value={newComment} onChange={(e) => setNewComment(e.target.value)} />
              <Input placeholder="Team" value={team} onChange={(e) => setTeam(e.target.value)} />
            </div>
            <Button className="mt-2" onClick={addOKR}>Add OKR</Button>
          </div>
        </TabsContent>

        <TabsContent value="dashboard">
          <h2 className="text-xl font-semibold mb-2">OKR Progress Chart</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Progress" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
    </main>
  );
}
// Full React code will be injected here in real app
