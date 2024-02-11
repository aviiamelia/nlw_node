-- CreateTable
CREATE TABLE "PollOpition" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,

    CONSTRAINT "PollOpition_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PollOpition" ADD CONSTRAINT "PollOpition_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
