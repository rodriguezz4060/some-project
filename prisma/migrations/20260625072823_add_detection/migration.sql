-- CreateTable
CREATE TABLE "Photo" (
    "id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "original" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploaderId" INTEGER NOT NULL,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Detection" (
    "id" SERIAL NOT NULL,
    "photoId" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "x1" DOUBLE PRECISION NOT NULL,
    "y1" DOUBLE PRECISION NOT NULL,
    "x2" DOUBLE PRECISION NOT NULL,
    "y2" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Detection_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Detection" ADD CONSTRAINT "Detection_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Photo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
